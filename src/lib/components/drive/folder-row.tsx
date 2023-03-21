import { Dispatch, SetStateAction, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UseMutateAsyncFunction } from '@tanstack/react-query';
import { format, isToday } from 'date-fns';
import { Folder } from 'lucide-react';
import { useMultiDrag, useMultiDrop } from 'react-dnd-multi-backend';

import { clientRoutes } from '@/lib/data/routes';
import { FileNodeDecrypted, FolderNodeDecrypted } from '@/lib/types/drive';
import { cn } from '@/lib/utils/cn';
import { getEmptyImage } from '@/lib/utils/get-empty-image';

export function FolderRow({
    folder,
    selectNode,
    selectedNodes,
    setSelectedNodes,
    onMove,
}: {
    folder: FolderNodeDecrypted;
    selectNode: (
        node: FolderNodeDecrypted | FileNodeDecrypted,
        type: 'folder' | 'file'
    ) => void;
    selectedNodes: (
        | {
              node: FolderNodeDecrypted;
              type: 'folder';
          }
        | {
              node: FileNodeDecrypted;
              type: 'file';
          }
    )[];
    setSelectedNodes: Dispatch<
        SetStateAction<
            (
                | {
                      node: FolderNodeDecrypted;
                      type: 'folder';
                  }
                | {
                      node: FileNodeDecrypted;
                      type: 'file';
                  }
            )[]
        >
    >;
    onMove: UseMutateAsyncFunction<
        void,
        unknown,
        {
            items: (
                | { node: FolderNodeDecrypted; type: 'folder' }
                | { node: FileNodeDecrypted; type: 'file' }
            )[];
            destinationFolderId: string;
            destinationFolderKey: string;
        },
        unknown
    >;
}) {
    const router = useRouter();
    const isSelected =
        selectedNodes.findIndex(n => n.node.id === folder.id) >= 0;

    const [[_, drag, preview]] = useMultiDrag({
        type: 'NODE',
        item:
            selectedNodes.length > 0
                ? selectedNodes
                : [{ node: folder, type: 'folder' as const }],
        collect: (monitor: any) => ({
            isDragging: monitor.isDragging(),
        }),
        canDrag: isSelected || selectedNodes.length === 0,
    });

    const [[dropProps, drop]] = useMultiDrop<
        unknown,
        unknown,
        { canDrop: boolean; isOver: boolean }
    >({
        accept: 'NODE',
        drop: async items => {
            onMove({
                items: items as (
                    | { node: FolderNodeDecrypted; type: 'folder' }
                    | { node: FileNodeDecrypted; type: 'file' }
                )[],
                destinationFolderId: folder.id,
                destinationFolderKey: folder.key,
            });
        },
        canDrop: items =>
            !isSelected &&
            (items as { node: FileNodeDecrypted; type: 'folder' }[]).some(
                i => i.node.id !== folder.id
            ),
        collect: (monitor: any) => ({
            canDrop: monitor.canDrop(),
            isOver: monitor.isOver(),
        }),
    });

    useEffect(() => {
        preview(getEmptyImage(), {
            captureDraggingState: true,
        });
    }, [preview]);

    return (
        <tr
            key={folder.id}
            className={cn('text-gray-900', {
                'bg-gray-300': isSelected,
                'hover:bg-gray-200': !isSelected,
                'bg-gray-200': dropProps.isOver && dropProps.canDrop,
            })}
            onClick={() =>
                setSelectedNodes(prev => {
                    if (isSelected) {
                        return prev.filter(n => n.node.id !== folder.id);
                    }

                    return [
                        ...prev,
                        {
                            node: folder as FolderNodeDecrypted,
                            type: 'folder',
                        },
                    ];
                })
            }
            onContextMenu={() =>
                setSelectedNodes(prev => {
                    if (isSelected) {
                        return prev;
                    }

                    return [
                        {
                            node: folder as FolderNodeDecrypted,
                            type: 'folder',
                        },
                    ];
                })
            }>
            <td className='py-2 text-center'>
                <label htmlFor={`checkbox-${folder.id}`} className='sr-only'>
                    Select
                </label>
                <input
                    onClick={e => e.stopPropagation()}
                    onChange={() => selectNode(folder, 'folder')}
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
                onDoubleClick={() =>
                    router.push(`${clientRoutes.drive}/${folder.id}`)
                }>
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
                {isToday(
                    new Date(new Date(folder.metadata.modified).toISOString())
                )
                    ? format(
                          new Date(
                              new Date(folder.metadata.modified).toISOString()
                          ),
                          'h:mm:ss b'
                      )
                    : format(
                          new Date(
                              new Date(folder.metadata.modified).toISOString()
                          ),
                          'MMM d, y, h:mm b'
                      )}
            </td>
            <td className='hidden py-2 text-sm md:table-cell'>-</td>
        </tr>
    );
}
