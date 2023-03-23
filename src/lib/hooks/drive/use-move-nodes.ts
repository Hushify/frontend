import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

import { apiRoutes } from '@/lib/data/routes';
import { CryptoWorkerInstance } from '@/lib/services/comlink-crypto';
import { list, moveNodes } from '@/lib/services/drive';
import { useAuthStore } from '@/lib/stores/auth-store';
import { DriveList, SelectedNode } from '@/lib/types/drive';

export function useMoveNodes(
    currentFolderId: string | null,
    accessToken: string,
    onSuccess: () => void
) {
    const masterKey = useAuthStore(state => state.masterKey);
    const queryClient = useQueryClient();

    const queryKey = currentFolderId
        ? `${apiRoutes.drive.list}?folderId=${currentFolderId}`
        : apiRoutes.drive.list;

    const move = useCallback(
        async (data: {
            items: SelectedNode[];
            destinationFolderId: string;
            destinationFolderKey: string;
        }) => {
            if (!masterKey) {
                throw new Error('Master key not found!');
            }

            const crypto = CryptoWorkerInstance;

            const destinationData = await queryClient.fetchQuery<DriveList>(
                [`${apiRoutes.drive.list}?folderId=${data.destinationFolderId}`],
                () =>
                    list(
                        `${apiRoutes.drive.list}?folderId=${data.destinationFolderId}`,
                        accessToken,
                        masterKey,
                        crypto
                    )
            );

            if (destinationData) {
                for (const folder of data.items.filter(n => n.type === 'folder')) {
                    if (
                        destinationData.folders.find(
                            f => f.metadata.name === folder.node.metadata.name
                        )
                    ) {
                        throw new Error('Folder/s with that name already exist!');
                    }
                }
            }

            const currentDate = new Date().toISOString();

            const items = await Promise.all(
                data.items.map(async item => {
                    const node = item.node;
                    node.metadata.modified = currentDate;
                    const { key, encryptedKey, nonce } = await crypto.reEncryptKey(
                        data.destinationFolderKey,
                        node.key
                    );
                    const metadataBundle = await crypto.encryptMetadata(key, node.metadata);
                    const nodeToMove = {
                        id: item.node.id,
                        type: item.type,
                        metadataBundle,
                        keyBundle: {
                            encryptedKey,
                            nonce,
                        },
                    };

                    if (item.type === 'file') {
                        const previousVersion = destinationData.files.find(
                            f => f.metadata.name === item.node.metadata.name
                        );

                        return previousVersion
                            ? {
                                  ...nodeToMove,
                                  previousVersionId: previousVersion.id,
                              }
                            : nodeToMove;
                    }

                    return nodeToMove;
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
                onSuccess();
                return null;
            }

            throw new Error('Error!');
        },
        [accessToken, masterKey, onSuccess, queryClient, queryKey]
    );

    return useMutation({
        mutationFn: async (data: {
            items: SelectedNode[];
            destinationFolderId: string;
            destinationFolderKey: string;
        }) => {
            try {
                await toast.promise(move(data), {
                    loading: 'Moving...',
                    success: `Successfully moved ${data.items.length} ${
                        data.items.length > 1 ? 'items' : 'item'
                    }!`,
                    error: error => (error as unknown as Error).message,
                });
            } catch {}
        },
    });
}
