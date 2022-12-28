import { getErrors, ResponseMessage } from '@/services/common';
import { CryptoService } from '@/services/crypto.worker';
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

export type FolderNodeDecrypted = {
    id: string;
    metadata: {
        name: string;
        modified: string;
    };
    folderKey: string;
};

export type DriveList = {
    workspaceFolderId: string;
    currentFolderId: string;
    breadcrumbs: Breadcrumb[];
    files: FileNode[];
    folders: FolderNodeDecrypted[];
};

export const list = async (
    url: string,
    accessToken: string,
    key: string
): Promise<DriveList> => {
    const { data } = await axios.get<DriveListResponse>(url, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    const folders = await Promise.all(
        data.folders.map(async f => {
            const worker = new Worker(
                new URL('@/services/crypto.worker', import.meta.url),
                {
                    type: 'module',
                    name: 'hushify-crypto-worker',
                }
            );

            const crypto = wrap<typeof CryptoService>(worker);

            const { folderKey, metadata } = await crypto.decryptKeyAndMetadata(
                key,
                f.folderKey.nonce,
                f.folderKey.encKey,
                f.metadataBundle.nonce,
                f.metadataBundle.metadata
            );

            return { id: f.id, metadata: JSON.parse(metadata), folderKey };
        })
    );

    return { ...data, folders };
};

export const createFolder = async <T>(
    url: string,
    accessToken: string,
    parentFolderId: string | null,
    metadataBundle: MetadataBundle,
    folderKeyBundle: SecretKeyBundle
): Promise<ResponseMessage<T, undefined>> => {
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
        return { success: true, data: undefined };
    }

    const errors = await getErrors<T>(response);
    return { success: false, errors };
};
