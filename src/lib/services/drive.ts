import { apiRoutes } from '@/lib/data/routes';
import { getErrors } from '@/lib/services/common';
import { CryptoService } from '@/lib/services/crypto';
import { MetadataBundle, SecretKeyBundle } from '@/lib/types/crypto';
import {
    BreadcrumbDecrypted,
    DriveList,
    DriveListResponse,
    FileMetadata,
    FileNodeDecrypted,
    FolderMetadata,
    FolderNodeDecrypted,
} from '@/lib/types/drive';
import { ResponseMessage } from '@/lib/types/http';
import { Remote } from '@/lib/utils/comlink';

export async function list(
    url: string,
    accessToken: string,
    masterKey: string,
    crypto: Remote<typeof CryptoService>
): Promise<DriveList> {
    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    const data = (await response.json()) as DriveListResponse;

    const breadcrumbs: BreadcrumbDecrypted[] = [];
    await data.breadcrumbs.reduce(async (promise, crumb, index) => {
        await promise;

        const key = await crypto.decryptFolderKey(
            index === 0 ? masterKey : breadcrumbs.at(index - 1)!.key,
            crumb.keyBundle.encryptedKey,
            crumb.keyBundle.nonce
        );

        const metadata = await crypto.decryptMetadata(
            key,
            crumb.metadataBundle.encryptedMetadata,
            crumb.metadataBundle.nonce
        );

        breadcrumbs.push({
            id: crumb.id,
            key,
            metadata: JSON.parse(metadata) as FolderMetadata,
            isShared: crumb.isShared,
        });
    }, Promise.resolve());

    const currentFolderKey = breadcrumbs.find(b => b.id === data.currentFolderId)?.key ?? masterKey;

    const folders: FolderNodeDecrypted[] = await Promise.all(
        data.folders.map(async f => {
            const key = await crypto.decryptFolderKey(
                currentFolderKey,
                f.keyBundle.encryptedKey,
                f.keyBundle.nonce
            );

            const metadata = await crypto.decryptMetadata(
                key,
                f.metadataBundle.encryptedMetadata,
                f.metadataBundle.nonce
            );

            return {
                id: f.id,
                metadata: JSON.parse(metadata) as FolderMetadata,
                key,
                isShared: f.isShared,
            };
        })
    );

    const files: FileNodeDecrypted[] = await Promise.all(
        data.files.map(async f => {
            const key = await crypto.decryptFileKey(
                currentFolderKey,
                f.keyBundle.encryptedKey,
                f.keyBundle.nonce
            );

            const metadata = await crypto.decryptMetadata(
                key,
                f.metadataBundle.encryptedMetadata,
                f.metadataBundle.nonce
            );

            return {
                id: f.id,
                metadata: JSON.parse(metadata) as FileMetadata,
                key,
                url: f.url,
                isShared: f.isShared,
            };
        })
    );

    return { ...data, folders, files, breadcrumbs };
}

export async function createFolder<T>(
    accessToken: string,
    parentFolderId: string | null,
    metadataBundle: MetadataBundle,
    keyBundle: SecretKeyBundle
): Promise<ResponseMessage<T, { id: string }>> {
    const response = await fetch(apiRoutes.drive.createFolder, {
        method: 'POST',
        body: JSON.stringify({
            parentFolderId,
            metadataBundle,
            keyBundle,
        }),
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (response.ok) {
        const data = (await response.json()) as { id: string };
        return { success: true, data };
    }

    const errors = await getErrors<T>(response);
    return { success: false, errors };
}

export async function deleteNodes<T>(
    folderIds: string[],
    fileIds: string[],
    accessToken: string
): Promise<ResponseMessage<T, { folderIds: string[]; fileIds: string[] }>> {
    const response = await fetch(apiRoutes.drive.deleteNodes, {
        method: 'POST',
        body: JSON.stringify({ folderIds, fileIds }),
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (response.ok) {
        const data = (await response.json()) as { folderIds: string[]; fileIds: string[] };
        return { success: true, data };
    }

    const errors = await getErrors<T>(response);
    return { success: false, errors };
}

export async function moveNodes<T>(
    accessToken: string,
    targetFolderId: string,
    folders: {
        id: string;
        metadataBundle: MetadataBundle;
        keyBundle: SecretKeyBundle;
    }[],
    files: {
        id: string;
        metadataBundle: MetadataBundle;
        keyBundle: SecretKeyBundle;
        previousVersionId?: string;
    }[]
): Promise<ResponseMessage<T, undefined>> {
    const response = await fetch(apiRoutes.drive.moveNodes, {
        method: 'POST',
        body: JSON.stringify({ targetFolderId, folders, files }),
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
}

export async function stats<T>(
    accessToken: string
): Promise<ResponseMessage<T, { total: number; used: number }>> {
    const response = await fetch(apiRoutes.drive.stats, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (response.ok) {
        const data = (await response.json()) as { total: number; used: number };
        return { success: true, data };
    }

    const errors = await getErrors<T>(response);
    return { success: false, errors };
}

export async function updateMetadata<T>(
    accessToken: string,
    id: string,
    type: 'folder' | 'file',
    metadataBundle: MetadataBundle
): Promise<ResponseMessage<T, { id: string }>> {
    const response = await fetch(apiRoutes.drive.updateMetadata, {
        method: 'POST',
        body: JSON.stringify({
            id,
            type,
            metadataBundle,
        }),
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (response.ok) {
        const data = (await response.json()) as { id: string };
        return { success: true, data };
    }

    const errors = await getErrors<T>(response);
    return { success: false, errors };
}
