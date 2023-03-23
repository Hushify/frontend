import { Dispatch, SetStateAction } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UseMutateAsyncFunction } from '@tanstack/react-query';
import { intlFormat, isToday } from 'date-fns';
import { Folder } from 'lucide-react';

import { clientRoutes } from '@/lib/data/routes';
import { useDrag } from '@/lib/hooks/drive/use-drag';
import { useDrop } from '@/lib/hooks/drive/use-drop';
import { FolderNodeDecrypted, SelectedNode } from '@/lib/types/drive';
import { cn } from '@/lib/utils/cn';

export function FolderRow({
    folder,
    selectNode,
    selectedNodes,
    setSelectedNodes,
    onMove,
}: {
    folder: FolderNodeDecrypted;
    selectNode: (node: SelectedNode) => void;
    selectedNodes: SelectedNode[];
    setSelectedNodes: Dispatch<SetStateAction<SelectedNode[]>>;
    onMove: UseMutateAsyncFunction<
        void,
        unknown,
        {
            items: SelectedNode[];
            destinationFolderId: string;
            destinationFolderKey: string;
        },
        unknown
    >;
}) {
    const router = useRouter();

    const { drag, isSelected } = useDrag({ node: folder, type: 'folder' }, selectedNodes);
    const { drop, dropProps } = useDrop(
        folder.id,
        folder.key,
        (items: SelectedNode[]) => !isSelected && items.some(i => i.node.id !== folder.id),
        onMove
    );

    return (
        <tr
            key={folder.id}
            className={cn('text-gray-900', {
                'bg-gray-300': isSelected,
                'hover:bg-gray-200': !isSelected,
                'bg-gray-200': dropProps.isOver && dropProps.canDrop,
            })}
            onClick={() =>
                setSelectedNodes(prev =>
                    isSelected
                        ? prev.filter(n => n.node.id !== folder.id)
                        : [...prev, { node: folder, type: 'folder' }]
                )
            }
            onContextMenu={() =>
                setSelectedNodes(prev =>
                    isSelected ? prev : [{ node: folder as FolderNodeDecrypted, type: 'folder' }]
                )
            }>
            <td className='py-2 text-center'>
                <label htmlFor={`checkbox-${folder.id}`} className='sr-only'>
                    Select
                </label>
                <input
                    onClick={e => e.stopPropagation()}
                    onChange={() => selectNode({ node: folder, type: 'folder' })}
                    checked={isSelected}
                    className='-mt-1 cursor-pointer rounded'
                    type='checkbox'
                    id={`checkbox-${folder.id}`}
                />
            </td>
            <td
                ref={el => {
                    drag(el);
                    drop(el);
                }}
                className='max-w-[300px] select-none whitespace-nowrap py-2 text-left'
                onDoubleClick={() => router.push(`${clientRoutes.drive}/${folder.id}`)}>
                <div className='flex items-center gap-2'>
                    <Folder className='h-5 w-5 shrink-0 fill-brand-600 text-brand-600' />
                    <Link
                        onClick={e => e.stopPropagation()}
                        href={`${clientRoutes.drive}/${folder.id}`}
                        className='max-w-[8rem] truncate text-sm sm:max-w-[32rem] md:max-w-full'>
                        {folder.metadata.name}
                    </Link>
                </div>
            </td>
            <td className='py-2 text-left text-sm'>
                {isToday(new Date(folder.metadata.modified))
                    ? `Today, ${intlFormat(new Date(folder.metadata.modified), {
                          hour: '2-digit',
                          minute: '2-digit',
                      })}`
                    : intlFormat(new Date(folder.metadata.modified), {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                      })}
            </td>
            <td className='hidden py-2 text-sm md:table-cell'>-</td>
        </tr>
    );
}
