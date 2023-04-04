import { Dispatch, SetStateAction, useCallback } from 'react';
import { getFileTypeIconProps } from '@fluentui/react-file-type-icons';
import { Icon } from '@fluentui/react/lib/Icon';
import { intlFormat, isToday } from 'date-fns';
import { MoreVertical } from 'lucide-react';

import { useDrag } from '@/lib/hooks/drive/use-drag';
import { useSelectFiles } from '@/lib/hooks/drive/use-select-files';
import { useClickOutsideTarget } from '@/lib/hooks/use-click-outside-target';
import { FileNodeDecrypted, SelectedNode } from '@/lib/types/drive';
import { cn } from '@/lib/utils/cn';
import { humanFileSize } from '@/lib/utils/humanized-file-size';

export function File({
    file,
    selectNode,
    selectedNodes,
    setSelectedNodes,
}: {
    file: FileNodeDecrypted;
    selectNode: (node: SelectedNode) => void;
    selectedNodes: SelectedNode[];
    setSelectedNodes: Dispatch<SetStateAction<SelectedNode[]>>;
}) {
    const { drag, isSelected } = useDrag({ node: file, type: 'file' }, selectedNodes);

    return (
        <li className='w-full' data-node={true}>
            <button
                onClick={e =>
                    setSelectedNodes(prev => {
                        if (e.metaKey || e.ctrlKey) {
                            return isSelected
                                ? prev.filter(n => n.node.id !== file.id)
                                : [...prev, { node: file, type: 'file' }];
                        }

                        return isSelected
                            ? prev.filter(n => n.node.id !== file.id)
                            : [{ node: file, type: 'file' }];
                    })
                }
                onContextMenu={() => {
                    if (isSelected) {
                        return;
                    }

                    setSelectedNodes([{ node: file as FileNodeDecrypted, type: 'file' }]);
                }}
                ref={drag}
                className={cn(
                    'group flex w-full select-none flex-col gap-2 truncate rounded bg-gray-200 px-3 py-2 font-medium text-black shadow transition-all',
                    {
                        'ring-1 ring-brand-600': isSelected,
                        'hover:ring-1 hover:ring-brand-600': !isSelected,
                    }
                )}>
                <div className='flex w-full items-center justify-between'>
                    <div className='flex items-center gap-1.5'>
                        <div className='relative flex h-5 w-5 shrink-0 items-center justify-center'>
                            <Icon
                                {...getFileTypeIconProps({
                                    extension: file.metadata.name.split('.').pop() || '',
                                })}
                                className={cn('absolute inset-0 h-5 w-5', 'group-hover:hidden', {
                                    [`hidden`]: isSelected,
                                })}
                            />

                            <div
                                className={cn(
                                    'absolute inset-0 -mt-1 hidden',
                                    'group-hover:block',
                                    {
                                        [`block`]: isSelected,
                                    }
                                )}>
                                <label htmlFor={`checkbox-${file.id}`} className='sr-only'>
                                    Select {file.metadata.name}
                                </label>
                                <input
                                    onClick={e => e.stopPropagation()}
                                    onChange={() => selectNode({ node: file, type: 'file' })}
                                    checked={isSelected}
                                    className='cursor-pointer rounded'
                                    type='checkbox'
                                    id={`checkbox-${file.id}`}
                                    tabIndex={-1}
                                />
                            </div>
                        </div>

                        <span title={file.metadata.name} className='max-w-[8rem] truncate text-sm'>
                            {file.metadata.name}
                        </span>
                    </div>
                    <MoreVertical className='h-5 w-5 rounded p-1 transition-colors hover:bg-gray-300' />
                </div>
                <div className='flex w-full items-center justify-between pr-2 text-xs'>
                    <span>
                        {isToday(new Date(file.metadata.modified))
                            ? `Today, ${intlFormat(new Date(file.metadata.modified), {
                                  hour: '2-digit',
                                  minute: '2-digit',
                              })}`
                            : intlFormat(new Date(file.metadata.modified), {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                              })}
                    </span>
                    <span>{humanFileSize(file.metadata.size, true)}</span>
                </div>
            </button>
        </li>
    );
}

export function Files({
    files,
    selectedNodes,
    setSelectedNodes,
}: {
    files: FileNodeDecrypted[];
    selectedNodes: SelectedNode[];
    setSelectedNodes: Dispatch<SetStateAction<SelectedNode[]>>;
}) {
    const fileListRef = useClickOutsideTarget<HTMLUListElement>('[data-node="true"]', () =>
        setSelectedNodes([])
    );

    const { selectAllFiles, selectAllFilesRef } = useSelectFiles(
        selectedNodes,
        setSelectedNodes,
        files
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

    if (files.length <= 0) {
        return null;
    }

    return (
        <div className='space-y-2 px-5 py-2'>
            <header className='flex items-center justify-between'>
                <h2 className='text-sm font-medium'>Files</h2>
                <div>
                    <label className='sr-only' htmlFor='SelectAllFiles'>
                        Select All
                    </label>
                    <input
                        type='checkbox'
                        className='-mt-1 cursor-pointer rounded'
                        id='SelectAllFiles'
                        onChange={selectAllFiles}
                        ref={selectAllFilesRef}
                    />
                </div>
            </header>
            <ul
                className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
                ref={fileListRef}>
                {files.map(file => (
                    <File
                        key={file.id}
                        selectNode={selectNode}
                        file={file}
                        selectedNodes={selectedNodes}
                        setSelectedNodes={setSelectedNodes}
                    />
                ))}
            </ul>
        </div>
    );
}
