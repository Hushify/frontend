import { Dispatch, SetStateAction, useEffect } from 'react';
import { intlFormat, isToday } from 'date-fns';
import { File } from 'lucide-react';
import { useMultiDrag } from 'react-dnd-multi-backend';

import { FileNodeDecrypted, SelectedNode } from '@/lib/types/drive';
import { cn } from '@/lib/utils/cn';
import { getEmptyImage } from '@/lib/utils/get-empty-image';
import { humanFileSize } from '@/lib/utils/humanized-file-size';

export function FileRow({
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
    const isSelected = selectedNodes.findIndex(n => n.node.id === file.id) >= 0;

    const [[_, drag, preview]] = useMultiDrag({
        type: 'NODE',
        item: selectedNodes.length > 0 ? selectedNodes : [{ node: file, type: 'file' as const }],
        collect: monitor => ({
            isDragging: monitor.isDragging(),
        }),
        canDrag: isSelected || selectedNodes.length === 0,
    });

    useEffect(() => {
        preview(getEmptyImage(), {
            captureDraggingState: true,
        });
    }, [preview]);

    return (
        <tr
            key={file.id}
            className={cn('text-gray-900', {
                'bg-gray-300': isSelected,
                'hover:bg-gray-200': !isSelected,
            })}
            onClick={() =>
                setSelectedNodes(prev => {
                    if (isSelected) {
                        return prev.filter(n => n.node.id !== file.id);
                    }

                    return [
                        ...prev,
                        {
                            node: file as FileNodeDecrypted,
                            type: 'file',
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
                            node: file as FileNodeDecrypted,
                            type: 'file',
                        },
                    ];
                })
            }>
            <td className='py-2 text-center'>
                <label htmlFor={`checkbox-${file.id}`} className='sr-only'>
                    Select
                </label>
                <input
                    onClick={e => e.stopPropagation()}
                    onChange={() => selectNode({ node: file, type: 'file' })}
                    checked={isSelected}
                    className='-mt-1 cursor-pointer rounded'
                    type='checkbox'
                    id={`checkbox-${file.id}`}
                />
            </td>
            <td ref={drag} className='max-w-[300px] whitespace-nowrap py-2 text-left'>
                <div className='flex items-center gap-2'>
                    <File className='h-5 w-5 shrink-0' />
                    <span className='max-w-[8rem] truncate text-sm sm:max-w-[16rem] md:max-w-full'>
                        {file.metadata.name}
                    </span>
                </div>
            </td>
            <td className='py-2 text-left text-sm'>
                {isToday(new Date(file.metadata.modified))
                    ? intlFormat(new Date(file.metadata.modified), {
                          hour: '2-digit',
                          minute: '2-digit',
                      })
                    : intlFormat(new Date(file.metadata.modified), {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                      })}
            </td>
            <td className='hidden py-2 text-sm md:table-cell'>
                {humanFileSize(file.metadata.size, true)}
            </td>
        </tr>
    );
}
