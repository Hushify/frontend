import { RefObject, useCallback } from 'react';
import Image from 'next/image';
import * as RadixContextMenu from '@radix-ui/react-context-menu';
import * as RadixScrollArea from '@radix-ui/react-scroll-area';
import { QueryStatus } from '@tanstack/react-query';
import { ChevronUp, ChevronsUpDown } from 'lucide-react';
import { RectReadOnly } from 'react-use-measure';

import undrawFileManager from '@/lib/assets/undraw_file_manager.svg';
import { ContextMenu } from '@/lib/components/context-menu';
import { FileRow } from '@/lib/components/drive/file-row';
import { FolderRow } from '@/lib/components/drive/folder-row';
import { useMoveNodes } from '@/lib/hooks/drive/use-move-nodes';
import { useSortedNodes } from '@/lib/hooks/drive/use-sorted-nodes';
import {
    DriveList,
    FileNodeDecrypted,
    FolderNodeDecrypted,
    SelectedNode,
} from '@/lib/types/drive';
import { MenuItem, MenuSeparator } from '@/lib/types/menu';
import { cn } from '@/lib/utils/cn';

export function Explorer({
    data,
    status,
    menuItems,
    bounds,
    boundsRest,
    divRef,
    selectAll,
    selectAllRef,
    selectedNodes,
    setSelectedNodes,
    moveMutation,
}: {
    data: DriveList | undefined;
    status: QueryStatus;
    menuItems: (MenuItem | MenuSeparator)[];
    bounds: RectReadOnly;
    boundsRest: RectReadOnly;
    divRef: RefObject<HTMLDivElement>;
    selectAll: () => void;
    selectAllRef: RefObject<HTMLInputElement>;
    selectedNodes: SelectedNode[];
    setSelectedNodes: React.Dispatch<React.SetStateAction<SelectedNode[]>>;
    moveMutation: ReturnType<typeof useMoveNodes>;
}) {
    const { sortKey, setSortKey, sortOrder, setSortOrder, files, folders } =
        useSortedNodes(data);

    const selectNode = useCallback(
        (
            node: FolderNodeDecrypted | FileNodeDecrypted,
            type: 'folder' | 'file'
        ) => {
            setSelectedNodes(prev => {
                const selected = prev.find(n => n.node.id === node.id);
                if (selected) {
                    return prev.filter(n => n.node.id !== node.id);
                }

                if (type === 'folder') {
                    return [
                        ...prev,
                        { node: node as FolderNodeDecrypted, type },
                    ];
                }

                return [...prev, { node: node as FileNodeDecrypted, type }];
            });
        },
        [setSelectedNodes]
    );

    return (
        <RadixScrollArea.Root
            style={{
                height:
                    document.body.clientHeight - bounds.top - boundsRest.height,
            }}
            className='w-full overflow-hidden'>
            <RadixContextMenu.Root>
                <RadixContextMenu.Trigger asChild>
                    <RadixScrollArea.Viewport
                        className='h-full w-full rounded'
                        ref={divRef}>
                        <table className='w-full'>
                            <thead className='sticky top-0 select-none border-b border-b-gray-400 bg-white text-sm text-gray-600'>
                                <tr>
                                    <th
                                        scope='col'
                                        className='w-16 py-3 text-center font-light'>
                                        <label
                                            className='sr-only'
                                            htmlFor='SelectAllOrNone'>
                                            Select All
                                        </label>
                                        <input
                                            type='checkbox'
                                            className='-mt-1 cursor-pointer rounded'
                                            id='SelectAllOrNone'
                                            onChange={selectAll}
                                            ref={selectAllRef}
                                        />
                                    </th>
                                    <th scope='col' className='py-3 text-left'>
                                        <button
                                            type='button'
                                            onClick={() => {
                                                if (sortKey === 'name') {
                                                    setSortOrder(prev =>
                                                        prev === 'asc'
                                                            ? 'desc'
                                                            : 'asc'
                                                    );
                                                } else {
                                                    setSortKey('name');
                                                    setSortOrder('asc');
                                                }
                                            }}
                                            className='flex items-center gap-1'>
                                            <span>Name</span>
                                            {sortKey === 'name' ? (
                                                <ChevronUp
                                                    className={cn('h-4', {
                                                        'rotate-180':
                                                            sortOrder ===
                                                            'desc',
                                                    })}
                                                />
                                            ) : (
                                                <ChevronsUpDown className='h-4' />
                                            )}
                                        </button>
                                    </th>
                                    <th
                                        scope='col'
                                        className='w-48 py-3 text-left lg:w-56'>
                                        <button
                                            type='button'
                                            onClick={() => {
                                                if (sortKey === 'modified') {
                                                    setSortOrder(prev =>
                                                        prev === 'asc'
                                                            ? 'desc'
                                                            : 'asc'
                                                    );
                                                } else {
                                                    setSortKey('modified');
                                                    setSortOrder('asc');
                                                }
                                            }}
                                            className='flex items-center gap-1'>
                                            <span>Modified</span>
                                            {sortKey === 'modified' ? (
                                                <ChevronUp
                                                    className={cn('h-4', {
                                                        'rotate-180':
                                                            sortOrder ===
                                                            'desc',
                                                    })}
                                                />
                                            ) : (
                                                <ChevronsUpDown className='h-4' />
                                            )}
                                        </button>
                                    </th>
                                    <th
                                        scope='col'
                                        className='hidden w-28 py-3 text-left md:table-cell lg:w-48'>
                                        <button
                                            type='button'
                                            onClick={() => {
                                                if (sortKey === 'size') {
                                                    setSortOrder(prev =>
                                                        prev === 'asc'
                                                            ? 'desc'
                                                            : 'asc'
                                                    );
                                                } else {
                                                    setSortKey('size');
                                                    setSortOrder('asc');
                                                }
                                            }}
                                            className='flex items-center gap-1'>
                                            <span>Size</span>
                                            {sortKey === 'size' ? (
                                                <ChevronUp
                                                    className={cn('h-4', {
                                                        'rotate-180':
                                                            sortOrder ===
                                                            'desc',
                                                    })}
                                                />
                                            ) : (
                                                <ChevronsUpDown className='h-4' />
                                            )}
                                        </button>
                                    </th>
                                </tr>
                            </thead>
                            {status === 'success' &&
                                data &&
                                data.folders.length === 0 &&
                                data.files.length === 0 && (
                                    <tbody>
                                        <tr>
                                            <td colSpan={10}>
                                                <div className='absolute inset-0 flex select-none items-center justify-center'>
                                                    <Image
                                                        draggable={false}
                                                        className='w-1/2 xl:w-1/3'
                                                        src={undrawFileManager}
                                                        alt='File Manager'
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                )}
                            {status === 'success' &&
                                data &&
                                (data.folders.length || data.files.length > 0) >
                                    0 && (
                                    <tbody className='divide-y divide-gray-200'>
                                        {folders.map(folder => (
                                            <FolderRow
                                                key={folder.id}
                                                selectNode={selectNode}
                                                folder={folder}
                                                selectedNodes={selectedNodes}
                                                setSelectedNodes={
                                                    setSelectedNodes
                                                }
                                                onMove={
                                                    moveMutation.mutateAsync
                                                }
                                            />
                                        ))}
                                        {files.map(file => (
                                            <FileRow
                                                key={file.id}
                                                selectNode={selectNode}
                                                file={file}
                                                selectedNodes={selectedNodes}
                                                setSelectedNodes={
                                                    setSelectedNodes
                                                }
                                            />
                                        ))}
                                    </tbody>
                                )}
                        </table>
                    </RadixScrollArea.Viewport>
                </RadixContextMenu.Trigger>
                <ContextMenu items={menuItems} />
            </RadixContextMenu.Root>
            <RadixScrollArea.Scrollbar
                className='flex touch-none select-none bg-gray-200 p-0.5 transition-colors duration-150 ease-out hover:bg-gray-400 data-[orientation=horizontal]:h-2.5 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col'
                orientation='vertical'>
                <RadixScrollArea.Thumb className="relative flex-1 rounded-[10px] bg-gray-500 before:absolute before:top-1/2 before:left-1/2 before:h-full before:min-h-[44px] before:w-full before:min-w-[44px] before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']" />
            </RadixScrollArea.Scrollbar>
            <RadixScrollArea.Scrollbar
                className='flex touch-none select-none bg-gray-200 p-0.5 transition-colors duration-150 ease-out hover:bg-gray-400 data-[orientation=horizontal]:h-2.5 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col'
                orientation='horizontal'>
                <RadixScrollArea.Thumb className="relative flex-1 rounded-[10px] bg-gray-500 before:absolute before:top-1/2 before:left-1/2 before:h-full before:min-h-[44px] before:w-full before:min-w-[44px] before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']" />
            </RadixScrollArea.Scrollbar>
            <RadixScrollArea.Corner className='bg-gray-500' />
        </RadixScrollArea.Root>
    );
}
