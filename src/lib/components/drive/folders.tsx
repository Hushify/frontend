import { Dispatch, SetStateAction, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { UseMutateAsyncFunction } from '@tanstack/react-query';
import { intlFormat, isToday } from 'date-fns';
import { Folder as FolderIcon, MoreVertical } from 'lucide-react';

import { clientRoutes } from '@/lib/data/routes';
import { useDrag } from '@/lib/hooks/drive/use-drag';
import { useDrop } from '@/lib/hooks/drive/use-drop';
import { useSelectFolders } from '@/lib/hooks/drive/use-select-folders';
import { useClickOutsideTarget } from '@/lib/hooks/use-click-outside-target';
import { FolderNodeDecrypted, SelectedNode } from '@/lib/types/drive';
import { cn } from '@/lib/utils/cn';

export function Folder({
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
        <li className='w-full' data-node={true}>
            <button
                onKeyDown={e => {
                    if (e.key === 'Enter') {
                        router.push(`${clientRoutes.drive}/${folder.id}`);
                    }
                }}
                onClick={e =>
                    setSelectedNodes(prev => {
                        if (e.metaKey || e.ctrlKey) {
                            return isSelected
                                ? prev.filter(n => n.node.id !== folder.id)
                                : [...prev, { node: folder, type: 'folder' }];
                        }

                        return isSelected
                            ? prev.filter(n => n.node.id !== folder.id)
                            : [{ node: folder, type: 'folder' }];
                    })
                }
                onDoubleClick={() => router.push(`${clientRoutes.drive}/${folder.id}`)}
                onContextMenu={() => {
                    if (isSelected) {
                        return;
                    }

                    setSelectedNodes([{ node: folder as FolderNodeDecrypted, type: 'folder' }]);
                }}
                ref={el => {
                    drag(el);
                    drop(el);
                }}
                className={cn(
                    'group flex w-full select-none flex-col gap-2 truncate rounded bg-gray-200 px-3 py-2 font-medium text-black shadow transition-all',
                    {
                        'ring-1 ring-brand-600': isSelected,
                        'hover:ring-1 hover:ring-brand-600': !isSelected,
                        'bg-brand-200': dropProps.isOver && dropProps.canDrop,
                    }
                )}>
                <div className='flex w-full items-center justify-between'>
                    <div className='flex items-center gap-1.5'>
                        <div className='relative flex h-5 w-5 shrink-0 items-center justify-center'>
                            <FolderIcon
                                className={cn(
                                    'absolute inset-0 h-5 w-5 fill-brand-600 text-brand-600',
                                    'group-hover:hidden',
                                    {
                                        [`hidden`]: isSelected,
                                    }
                                )}
                            />
                            <div
                                className={cn(
                                    'absolute inset-0 -mt-1 hidden',
                                    'group-hover:block',
                                    {
                                        [`block`]: isSelected,
                                    }
                                )}>
                                <label htmlFor={`checkbox-${folder.id}`} className='sr-only'>
                                    Select {folder.metadata.name}
                                </label>
                                <input
                                    onClick={e => e.stopPropagation()}
                                    onChange={() => selectNode({ node: folder, type: 'folder' })}
                                    checked={isSelected}
                                    className='cursor-pointer rounded'
                                    type='checkbox'
                                    id={`checkbox-${folder.id}`}
                                    tabIndex={-1}
                                />
                            </div>
                        </div>

                        <span
                            title={folder.metadata.name}
                            className='max-w-[8rem] truncate text-sm'>
                            {folder.metadata.name}
                        </span>
                    </div>
                    <MoreVertical className='h-5 w-5 rounded p-1 transition-colors hover:bg-gray-300' />
                </div>
                <span className='text-xs'>
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
                </span>
            </button>
        </li>
    );
}

export function Folders({
    folders,
    selectedNodes,
    setSelectedNodes,
    onMove,
}: {
    folders: FolderNodeDecrypted[];
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
    const folderListRef = useClickOutsideTarget<HTMLUListElement>('[data-node="true"]', () =>
        setSelectedNodes([])
    );

    const { selectAllFoldersRef, selectAllFolders } = useSelectFolders(
        selectedNodes,
        setSelectedNodes,
        folders
    );

    const selectNode = useCallback(
        (node: SelectedNode) => {
            setSelectedNodes(prev => {
                const selected = prev.find(n => n.node.id === node.node.id);
                if (selected) {
                    return prev.filter(n => n.node.id !== node.node.id);
                }

                return [...prev, node];
            });
        },
        [setSelectedNodes]
    );

    if (folders.length <= 0) {
        return null;
    }

    return (
        <div className='space-y-2 px-5 py-2'>
            <header className='flex items-center justify-between'>
                <h2 className='text-sm font-medium'>Folders</h2>
                <div>
                    <label className='sr-only' htmlFor='SelectAllFolders'>
                        Select All
                    </label>
                    <input
                        type='checkbox'
                        className='-mt-1 cursor-pointer rounded'
                        id='SelectAllFolders'
                        onChange={selectAllFolders}
                        ref={selectAllFoldersRef}
                    />
                </div>
            </header>
            <ul
                className='grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
                ref={folderListRef}>
                {folders.map(folder => (
                    <Folder
                        key={folder.id}
                        selectNode={selectNode}
                        folder={folder}
                        selectedNodes={selectedNodes}
                        setSelectedNodes={setSelectedNodes}
                        onMove={onMove}
                    />
                ))}
            </ul>
        </div>
    );
}
