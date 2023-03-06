import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

import { apiRoutes } from '@/lib/data/routes';
import CryptoWorker from '@/lib/services/comlink-crypto';
import {
    DriveList,
    FileNodeDecrypted,
    FolderNodeDecrypted,
    moveNodes,
} from '@/lib/services/drive';

export function useMoveNodes(
    currentFolderId: string | null,
    accessToken: string
) {
    const queryClient = useQueryClient();

    const queryKey = currentFolderId
        ? `${apiRoutes.drive.list}?folderId=${currentFolderId}`
        : apiRoutes.drive.list;

    const move = useCallback(
        async (data: {
            items: (
                | { node: FolderNodeDecrypted; type: 'folder' }
                | { node: FileNodeDecrypted; type: 'file' }
            )[];
            destinationFolderId: string;
            destinationFolderKey: string;
        }) => {
            const crypto = CryptoWorker.cryptoWorker;

            const currentDate = new Date().toUTCString();

            const items = await Promise.all(
                data.items.map(async item => {
                    const node = item.node;
                    node.metadata.modified = currentDate;
                    const { key, encryptedKey, nonce } =
                        await crypto.reEncryptKey(
                            data.destinationFolderKey,
                            node.key
                        );
                    const metadataBundle = await crypto.encryptMetadata(
                        key,
                        node.metadata
                    );
                    return {
                        id: item.node.id,
                        type: item.type,
                        metadataBundle,
                        keyBundle: {
                            encryptedKey,
                            nonce,
                        },
                    };
                })
            );

            const result = await moveNodes(
                accessToken,
                data.destinationFolderId,
                items.filter(f => f.type === 'folder'),
                items.filter(f => f.type === 'file')
            );
            if (result.success) {
                queryClient.setQueryData<DriveList>([queryKey], queryData => {
                    if (!queryData) {
                        return undefined;
                    }

                    return {
                        ...queryData,
                        folders: queryData.folders.filter(
                            f => !data.items.some(i => i.node.id === f.id)
                        ),
                        files: queryData.files.filter(
                            f => !data.items.some(i => i.node.id === f.id)
                        ),
                    };
                });
                return null;
            }

            throw new Error('Error!');
        },
        [accessToken, queryClient, queryKey]
    );

    return useMutation({
        mutationFn: async (data: {
            items: (
                | { node: FolderNodeDecrypted; type: 'folder' }
                | { node: FileNodeDecrypted; type: 'file' }
            )[];
            destinationFolderId: string;
            destinationFolderKey: string;
        }) => {
            await toast.promise(move(data), {
                loading: 'Moving...',
                success: `Successfully moved ${data.items.length} ${
                    data.items.length > 1 ? 'items' : 'item'
                }!`,
                error: 'Error!',
            });
        },
        onError(_error, _variables, _context) {
            toast.error('Rename failed!');
        },
    });
}
