import { UseMutateAsyncFunction } from '@tanstack/react-query';
import { useMultiDrop } from 'react-dnd-multi-backend';

import { SelectedNode } from '@/lib/types/drive';

export function useDrop(
    destinationFolderId: string,
    destinationFolderKey: string,
    canDrop: (items: SelectedNode[]) => boolean,
    onMove: UseMutateAsyncFunction<
        void,
        unknown,
        {
            items: SelectedNode[];
            destinationFolderId: string;
            destinationFolderKey: string;
        },
        unknown
    >
) {
    const [[dropProps, drop]] = useMultiDrop({
        accept: 'NODE',
        drop: async (items: SelectedNode[]) => {
            await onMove({
                items: items,
                destinationFolderId,
                destinationFolderKey,
            });
        },
        canDrop,
        collect: monitor => ({
            canDrop: monitor.canDrop(),
            isOver: monitor.isOver(),
        }),
    });

    return { dropProps, drop };
}
