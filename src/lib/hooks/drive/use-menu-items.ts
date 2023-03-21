import { Dispatch, RefObject, SetStateAction, useMemo } from 'react';
import { Download, Eye, Folder, Pencil, Plus, Trash2, Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { FileNodeDecrypted, SelectedNode } from '@/lib/types/drive';
import { MenuItem, MenuSeparator } from '@/lib/types/menu';
import { downloadFile, downloadMultiple } from '@/lib/utils/download';

export function useMenuItems(
    selectedNodes: SelectedNode[],
    deleteNodes: ({
        folderIds,
        fileIds,
    }: {
        folderIds: string[];
        fileIds: string[];
    }) => Promise<void>,
    setFileForPreview: Dispatch<SetStateAction<FileNodeDecrypted | undefined>>,
    setIsNewFolderOpen: Dispatch<SetStateAction<boolean>>,
    setIsPreviewOpen: Dispatch<SetStateAction<boolean>>,
    setIsRenameOpen: Dispatch<SetStateAction<boolean>>,
    folderRef: RefObject<HTMLInputElement>,
    fileRef: RefObject<HTMLInputElement>
) {
    const menuItems: (MenuItem | MenuSeparator)[] = useMemo(() => {
        if (selectedNodes.length <= 0) {
            return [
                {
                    type: 'item',
                    name: 'Create Folder',
                    action: () => setIsNewFolderOpen(true),
                    icon: Plus,
                    textOnly: false,
                    variant: 'secondary',
                    disabled: false,
                },
                {
                    type: 'item',
                    name: 'Upload Folder',
                    action: () => {
                        if (!folderRef.current) {
                            return;
                        }

                        folderRef.current.click();
                    },
                    icon: Folder,
                    textOnly: false,
                    variant: 'secondary',
                    disabled: false,
                    className: 'hidden md:flex',
                },
                {
                    type: 'item',
                    name: 'Upload Files',
                    action: () => {
                        if (!fileRef.current) {
                            return;
                        }

                        fileRef.current.click();
                    },
                    icon: Upload,
                    textOnly: false,
                    variant: 'secondary',
                    disabled: false,
                },
            ];
        }

        const items: (MenuItem | MenuSeparator)[] = [
            {
                type: 'item',
                name: 'Download',
                action: async () => {
                    if (selectedNodes.length === 1) {
                        await toast.promise(
                            downloadFile(selectedNodes[0].node as FileNodeDecrypted),
                            {
                                success: 'Downloaded!',
                                error: 'Download failed!',
                                loading: 'Downloading...',
                            }
                        );
                    } else {
                        await toast.promise(downloadMultiple(selectedNodes), {
                            success: 'Downloaded!',
                            error: 'Download failed!',
                            loading: 'Downloading...',
                        });
                    }
                },
                icon: Download,
                textOnly: false,
                variant: 'primary',
                disabled: false,
            },
        ];

        if (selectedNodes.length == 1) {
            items.push({
                type: 'item' as const,
                name: 'Rename',
                action: () => setIsRenameOpen(true),
                icon: Pencil,
                textOnly: false,
                variant: 'secondary',
                disabled: false,
            });
        }

        if (
            selectedNodes.length == 1 &&
            selectedNodes[0].type === 'file' &&
            (selectedNodes[0].node.metadata.mimeType.startsWith('image/') ||
                selectedNodes[0].node.metadata.mimeType.startsWith('video/') ||
                selectedNodes[0].node.metadata.mimeType.startsWith('audio/') ||
                selectedNodes[0].node.metadata.mimeType.startsWith('application/pdf')) &&
            selectedNodes[0].node.metadata.size <= 5 * 1024 * 1024
        ) {
            items.push({
                type: 'item' as const,
                name: 'Preview',
                action: () => {
                    setFileForPreview(selectedNodes[0].node as FileNodeDecrypted);
                    setIsPreviewOpen(true);
                },
                icon: Eye,
                textOnly: false,
                variant: 'secondary',
                disabled: false,
            });
        }

        items.push({
            type: 'separator',
            id: '1',
        });

        items.push({
            type: 'item',
            name: 'Delete',
            action: () =>
                toast.promise(
                    deleteNodes({
                        folderIds: selectedNodes
                            .filter(n => n.type === 'folder')
                            .map(n => n.node.id),
                        fileIds: selectedNodes.filter(n => n.type === 'file').map(n => n.node.id),
                    }),
                    {
                        error: 'Failed to delete!',
                        loading: 'Deleting...',
                        success: 'Deleted!',
                    }
                ),
            icon: Trash2,
            textOnly: false,
            variant: 'danger',
            disabled: false,
        });

        return items;
    }, [
        deleteNodes,
        fileRef,
        folderRef,
        selectedNodes,
        setFileForPreview,
        setIsNewFolderOpen,
        setIsPreviewOpen,
        setIsRenameOpen,
    ]);

    return menuItems;
}
