import { getErrors, ResponseMessage } from '@/lib/services/common';
import { CryptoService } from '@/lib/services/crypto.worker';
import axios from 'axios';
import { wrap } from 'comlink';

export type MetadataBundle = {
    nonce: string;
    metadata: string;
};

export type SecretKeyBundle = {
    nonce: string;
    encKey: string;
};

export type Breadcrumb = {
    id: string;
    metadataBundle: MetadataBundle;
    folderKey: SecretKeyBundle;
};

export type FileNode = {
    id: string;
    metadataBundle: MetadataBundle;
    encryptedSize: number;
    fileKey: SecretKeyBundle;
    fileUrl: string;
};

export type FolderNode = {
    id: string;
    metadataBundle: MetadataBundle;
    folderKey: SecretKeyBundle;
};

export type DriveListResponse = {
    workspaceFolderId: string;
    currentFolderId: string;

    breadcrumbs: Breadcrumb[];

    files: FileNode[];
    folders: FolderNode[];
};

export type FolderMetadata = {
    name: string;
    modified: string;
    created: string;
};

export type FolderNodeDecrypted = {
    id: string;
    metadata: FolderMetadata;
    folderKey: string;
};

export type BreadcrumbDecrypted = {
    id: string;
    metadata: FolderMetadata;
    key: string;
};

export type DriveList = {
    workspaceFolderId: string;
    currentFolderId: string;

    breadcrumbs: BreadcrumbDecrypted[];

    files: FileNode[];
    folders: FolderNodeDecrypted[];
};

export const list = async (
    url: string,
    accessToken: string,
    masterKey: string
): Promise<DriveList> => {
    const { data } = await axios.get<DriveListResponse>(url, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    const worker = new Worker(
        new URL('@/lib/services/crypto.worker', import.meta.url),
        {
            type: 'module',
            name: 'hushify-crypto-worker',
        }
    );
    const crypto = wrap<typeof CryptoService>(worker);

    const breadcrumbs: BreadcrumbDecrypted[] = [];
    await data.breadcrumbs.reduce(async (promise, crumb, index) => {
        await promise;

        const key = await crypto.decryptFolderKey(
            index === 0 ? masterKey : breadcrumbs.at(index - 1)!.key,
            crumb.folderKey.encKey,
            crumb.folderKey.nonce
        );

        const metadata = await crypto.decryptFolderMetadata(
            key,
            crumb.metadataBundle.metadata,
            crumb.metadataBundle.nonce
        );

        breadcrumbs.push({
            id: crumb.id,
            key,
            metadata: JSON.parse(metadata) as FolderMetadata,
        });
    }, Promise.resolve());

    const currentFolderKey =
        breadcrumbs.find(b => b.id === data.currentFolderId)?.key ?? masterKey;

    const folders: FolderNodeDecrypted[] = await Promise.all(
        data.folders.map(async f => {
            const folderKey = await crypto.decryptFolderKey(
                currentFolderKey,
                f.folderKey.encKey,
                f.folderKey.nonce
            );

            const metadata = await crypto.decryptFolderMetadata(
                folderKey,
                f.metadataBundle.metadata,
                f.metadataBundle.nonce
            );

            return {
                id: f.id,
                metadata: JSON.parse(metadata) as FolderMetadata,
                folderKey,
            };
        })
    );

    folders.sort((a, b) =>
        a.metadata.name.localeCompare(b.metadata.name, undefined, {
            numeric: true,
        })
    );

    return { ...data, folders, breadcrumbs };
};

export const createFolder = async <T>(
    url: string,
    accessToken: string,
    parentFolderId: string | null,
    metadataBundle: MetadataBundle,
    folderKeyBundle: SecretKeyBundle
): Promise<ResponseMessage<T, { id: string }>> => {
    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({
            parentFolderId,
            metadataBundle,
            folderKeyBundle,
        }),
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (response.ok) {
        const data = await response.json();
        return { success: true, data };
    }

    const errors = await getErrors<T>(response);
    return { success: false, errors };
};

export const deleteFolder = async <T>(
    url: string,
    accessToken: string
): Promise<ResponseMessage<T, { id: string }>> => {
    const response = await fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (response.ok) {
        const data = await response.json();
        return { success: true, data };
    }

    const errors = await getErrors<T>(response);
    return { success: false, errors };
};
