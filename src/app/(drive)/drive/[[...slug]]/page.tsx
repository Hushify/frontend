'use client';

import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as ContextMenu from '@radix-ui/react-context-menu';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { useMutation, useQuery } from '@tanstack/react-query';
import { format, isToday } from 'date-fns';
import {
    ChevronUp,
    ChevronsUpDown,
    Copy,
    Folder,
    FolderUp,
    Loader,
    Move,
    Plus,
    Trash2,
    Upload,
} from 'lucide-react';
import { FileWithPath, useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import useMeasure from 'react-use-measure';

import Breadcrumbs from '@/lib/components/drive/breadcrumbs';
import { DriveContextMenu } from '@/lib/components/drive/context-menu';
import { NewFolderDialog } from '@/lib/components/drive/new-folder-dialog';
import { DriveToolbar } from '@/lib/components/drive/toolbar';
import { MenuItem, MenuSeparator } from '@/lib/components/drive/types/menu';
import { UploadProgressBox } from '@/lib/components/drive/upload-progress';
import { FullscreenUpload } from '@/lib/components/fullscreen-upload';
import { apiRoutes, clientRoutes } from '@/lib/data/routes';
import { useClickDirect } from '@/lib/hooks/use-click-direct';
import CryptoWorker from '@/lib/services/comlink-crypto';
import {
    BreadcrumbDecrypted,
    FileNode,
    FolderMetadata,
    FolderNodeDecrypted,
    deleteNodes,
    list,
} from '@/lib/services/drive';
import { useAuthStore } from '@/lib/stores/auth-store';
import { cn } from '@/lib/utils/cn';

function Drive({ params: { slug } }: { params: { slug?: string[] } }) {
    const router = useRouter();

    const currentFolder = slug?.at(0);

    const url = currentFolder
        ? `${apiRoutes.drive.list}?folderId=${currentFolder}`
        : apiRoutes.drive.list;

    const accessToken = useAuthStore(state => state.accessToken)!;
    const masterKey = useAuthStore(state => state.masterKey)!;

    const { data, status, refetch } = useQuery([url], () =>
        list(url, accessToken, masterKey, CryptoWorker.cryptoWorker)
    );

    const currentFolderId = currentFolder ?? null;
    const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);

    const onDrop = useCallback((acceptedFiles: FileWithPath[]) => {
        const map = new Map();

        acceptedFiles.forEach(f => {
            if (f.path!.includes('/')) {
                map.set(
                    f
                        .path!.slice(0, f.path!.lastIndexOf('/'))
                        .split('/')
                        .slice(1)
                        .join('/'),
                    crypto.randomUUID()
                );
            }
        });
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: true,
        noClick: true,
        noKeyboard: true,
    });

    const inputProps = useMemo(() => getInputProps(), [getInputProps]);

    const [ref, bounds] = useMeasure();
    const [refRest, boundsRest] = useMeasure();

    const selectAllRef = useRef<HTMLInputElement>(null);

    const [selectedNodes, setSelectedNodes] = useState<
        (
            | { node: FolderNodeDecrypted; type: 'folder' }
            | { node: FileNode; type: 'file' }
        )[]
    >([]);

    useEffect(() => {
        setSelectedNodes([]);
    }, [currentFolderId]);

    const selectAll = useCallback(() => {
        if (!selectAllRef.current) {
            return;
        }

        if (!data) {
            return;
        }

        if (!selectAllRef.current.checked) {
            setSelectedNodes([]);
            return;
        }

        setSelectedNodes([
            ...data.folders.map(node => ({
                node,
                type: 'folder' as const,
            })),
            ...data.files.map(node => ({ node, type: 'file' as const })),
        ]);
    }, [data]);

    const selectNode = useCallback(
        (node: FolderNodeDecrypted | FileNode, type: 'folder' | 'file') => {
            setSelectedNodes(prev => {
                const selected = prev.find(n => n.node.id === node.id);
                if (selected) {
                    return prev.filter(n => n.node.id !== node.id);
                }

                if (type === 'folder') {
                    return [
                        ...prev,
                        {
                            node: node as FolderNodeDecrypted,
                            type: 'folder',
                        },
                    ];
                }

                return [
                    ...prev,
                    {
                        node: node as FileNode,
                        type: 'file',
                    },
                ];
            });
        },
        []
    );

    const deleteNodesMutation = useMutation({
        mutationKey: [],
        mutationFn: async ({
            folderIds,
            fileIds,
        }: {
            folderIds: string[];
            fileIds: string[];
        }) => {
            const result = await deleteNodes(folderIds, fileIds, accessToken);
            if (!result.success) {
                throw new Error('Deletion failed!');
            }
        },
        onSuccess: () => {
            toast.success('Deleted!');
            setSelectedNodes([]);
            refetch();
        },
        onError: () => {
            toast.error('Deletion failed!');
        },
    });

    useLayoutEffect(() => {
        if (!selectAllRef.current) {
            return;
        }

        if (selectedNodes.length <= 0) {
            selectAllRef.current.indeterminate = false;
            selectAllRef.current.checked = false;
            return;
        }

        if (
            selectedNodes.length ===
            (data?.folders.length ?? 0) + (data?.files.length ?? 0)
        ) {
            selectAllRef.current.indeterminate = false;
            selectAllRef.current.checked = true;
            return;
        }

        selectAllRef.current.indeterminate = true;
    }, [data?.files.length, data?.folders.length, selectedNodes.length]);

    const menuItems: (MenuItem | MenuSeparator)[] = useMemo(
        () =>
            selectedNodes.length <= 0
                ? [
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
                          name: 'Upload File',
                          action: undefined,
                          icon: Upload,
                          textOnly: false,
                          variant: 'secondary',
                          disabled: false,
                      },
                      {
                          type: 'item',
                          name: 'Upload Folder',
                          action: undefined,
                          icon: FolderUp,
                          textOnly: false,
                          variant: 'secondary',
                          disabled: false,
                      },
                  ]
                : [
                      {
                          type: 'item',
                          name: 'Copy',
                          action: undefined,
                          icon: Copy,
                          textOnly: false,
                          variant: 'secondary',
                          disabled: false,
                      },
                      {
                          type: 'item',
                          name: 'Move',
                          action: undefined,
                          icon: Move,
                          textOnly: false,
                          variant: 'secondary',
                          disabled: false,
                      },
                      {
                          type: 'separator',
                          id: '1',
                      },
                      {
                          type: 'item',
                          name: 'Delete',
                          action: () =>
                              deleteNodesMutation.mutateAsync({
                                  folderIds: selectedNodes
                                      .filter(n => n.type === 'folder')
                                      .map(n => n.node.id),
                                  fileIds: selectedNodes
                                      .filter(n => n.type === 'file')
                                      .map(n => n.node.id),
                              }),
                          icon: Trash2,
                          textOnly: false,
                          variant: 'danger',
                          disabled: false,
                      },
                  ],
        [deleteNodesMutation, selectedNodes]
    );

    // TODO: Remove string and replace it with keyof FileMetadata
    const [sortKey, setSortKey] = useState<keyof FolderMetadata | string>(
        'name'
    );
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const folders = useMemo(
        () =>
            data?.folders.sort((a, b) => {
                let internalSortKey = sortKey;
                if (!Object.keys(a).includes(sortKey)) {
                    internalSortKey = 'name';
                }

                const aMetadata =
                    a.metadata[internalSortKey as keyof FolderMetadata];
                const bMetadata =
                    b.metadata[internalSortKey as keyof FolderMetadata];

                if (sortOrder === 'asc') {
                    return aMetadata.localeCompare(bMetadata, undefined, {
                        numeric: true,
                    });
                }

                return bMetadata.localeCompare(aMetadata, undefined, {
                    numeric: true,
                });
            }) ?? [],
        [data?.folders, sortKey, sortOrder]
    );

    const divRef = useRef<HTMLDivElement>(null);
    const clearSelection = useCallback(() => setSelectedNodes([]), []);
    useClickDirect(divRef, clearSelection);

    return (
        <div className='h-full w-full' {...getRootProps()}>
            <FullscreenUpload
                isDragActive={isDragActive}
                inputProps={inputProps}
            />

            {false && <UploadProgressBox />}

            <div className='relative h-full bg-white' ref={ref}>
                {status === 'error' && (
                    <div className='absolute inset-0 grid place-items-center text-red-600'>
                        Error
                    </div>
                )}

                {status === 'loading' && (
                    <div className='absolute inset-0 grid place-items-center'>
                        <Loader
                            size={32}
                            className='animate-spin stroke-brand-600'
                        />
                    </div>
                )}

                <div ref={refRest}>
                    <div className='relative z-10'>
                        <NewFolderDialog
                            currentFolderId={currentFolderId}
                            isNewFolderOpen={isNewFolderOpen}
                            setIsNewFolderOpen={setIsNewFolderOpen}
                        />
                    </div>

                    <DriveToolbar items={menuItems} />

                    <Breadcrumbs
                        items={
                            data?.breadcrumbs ?? ([] as BreadcrumbDecrypted[])
                        }
                    />
                </div>

                <ScrollArea.Root
                    style={{
                        height:
                            document.body.clientHeight -
                            bounds.top -
                            boundsRest.height,
                    }}
                    className='w-full overflow-hidden'>
                    <ContextMenu.Root>
                        <ContextMenu.Trigger asChild>
                            <ScrollArea.Viewport
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
                                            <th
                                                scope='col'
                                                className='py-3 text-left'>
                                                <button
                                                    type='button'
                                                    onClick={() => {
                                                        if (
                                                            sortKey === 'name'
                                                        ) {
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
                                                            className={cn(
                                                                'h-4',
                                                                {
                                                                    'rotate-180':
                                                                        sortOrder ===
                                                                        'desc',
                                                                }
                                                            )}
                                                        />
                                                    ) : (
                                                        <ChevronsUpDown className='h-4' />
                                                    )}
                                                </button>
                                            </th>
                                            <th
                                                scope='col'
                                                className='w-24 py-3 text-left md:w-48'>
                                                <button
                                                    type='button'
                                                    onClick={() => {
                                                        if (
                                                            sortKey ===
                                                            'modified'
                                                        ) {
                                                            setSortOrder(prev =>
                                                                prev === 'asc'
                                                                    ? 'desc'
                                                                    : 'asc'
                                                            );
                                                        } else {
                                                            setSortKey(
                                                                'modified'
                                                            );
                                                            setSortOrder('asc');
                                                        }
                                                    }}
                                                    className='flex items-center gap-1'>
                                                    <span>Modified</span>
                                                    {sortKey === 'modified' ? (
                                                        <ChevronUp
                                                            className={cn(
                                                                'h-4',
                                                                {
                                                                    'rotate-180':
                                                                        sortOrder ===
                                                                        'desc',
                                                                }
                                                            )}
                                                        />
                                                    ) : (
                                                        <ChevronsUpDown className='h-4' />
                                                    )}
                                                </button>
                                            </th>
                                            <th
                                                scope='col'
                                                className='hidden w-40 py-3 text-left md:table-cell'>
                                                <button
                                                    type='button'
                                                    onClick={() => {
                                                        if (
                                                            sortKey === 'size'
                                                        ) {
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
                                                            className={cn(
                                                                'h-4',
                                                                {
                                                                    'rotate-180':
                                                                        sortOrder ===
                                                                        'desc',
                                                                }
                                                            )}
                                                        />
                                                    ) : (
                                                        <ChevronsUpDown className='h-4' />
                                                    )}
                                                </button>
                                            </th>
                                        </tr>
                                    </thead>
                                    {status === 'success' && (
                                        <tbody className='divide-y divide-gray-200'>
                                            {folders.map(folder => {
                                                const isSelected =
                                                    selectedNodes.findIndex(
                                                        n =>
                                                            n.node.id ===
                                                            folder.id
                                                    ) >= 0;

                                                return (
                                                    <tr
                                                        key={folder.id}
                                                        className={cn(
                                                            'text-gray-900',
                                                            {
                                                                'bg-gray-300':
                                                                    isSelected,
                                                                'hover:bg-gray-200':
                                                                    !isSelected,
                                                            }
                                                        )}
                                                        onClick={() =>
                                                            setSelectedNodes(
                                                                prev => {
                                                                    if (
                                                                        isSelected
                                                                    ) {
                                                                        return prev.filter(
                                                                            n =>
                                                                                n
                                                                                    .node
                                                                                    .id !==
                                                                                folder.id
                                                                        );
                                                                    }

                                                                    return [
                                                                        ...prev,
                                                                        {
                                                                            node: folder as FolderNodeDecrypted,
                                                                            type: 'folder',
                                                                        },
                                                                    ];
                                                                }
                                                            )
                                                        }
                                                        onContextMenu={() =>
                                                            setSelectedNodes(
                                                                prev => {
                                                                    if (
                                                                        isSelected
                                                                    ) {
                                                                        return prev;
                                                                    }

                                                                    return [
                                                                        {
                                                                            node: folder as FolderNodeDecrypted,
                                                                            type: 'folder',
                                                                        },
                                                                    ];
                                                                }
                                                            )
                                                        }>
                                                        <td className='py-2 text-center'>
                                                            <label
                                                                htmlFor={`checkbox-${folder.id}`}
                                                                className='sr-only'>
                                                                Select
                                                            </label>
                                                            <input
                                                                onClick={e =>
                                                                    e.stopPropagation()
                                                                }
                                                                onChange={() =>
                                                                    selectNode(
                                                                        folder,
                                                                        'folder'
                                                                    )
                                                                }
                                                                checked={
                                                                    isSelected
                                                                }
                                                                className='-mt-1 cursor-pointer rounded'
                                                                type='checkbox'
                                                                id={`checkbox-${folder.id}`}
                                                            />
                                                        </td>
                                                        <td
                                                            className='max-w-[300px] whitespace-nowrap py-2 text-left'
                                                            onDoubleClick={() =>
                                                                router.push(
                                                                    `${clientRoutes.drive}/${folder.id}`
                                                                )
                                                            }>
                                                            <div className='flex items-center gap-2'>
                                                                <Folder className='h-4 w-4 shrink-0' />
                                                                <Link
                                                                    onClick={e =>
                                                                        e.stopPropagation()
                                                                    }
                                                                    href={`${clientRoutes.drive}/${folder.id}`}
                                                                    className='truncate text-sm'>
                                                                    {
                                                                        folder
                                                                            .metadata
                                                                            .name
                                                                    }
                                                                </Link>
                                                            </div>
                                                        </td>
                                                        <td className='py-2 text-left text-sm'>
                                                            {isToday(
                                                                new Date(
                                                                    folder.metadata.modified
                                                                )
                                                            )
                                                                ? format(
                                                                      new Date(
                                                                          folder.metadata.modified
                                                                      ),
                                                                      'h:mm:ss b'
                                                                  )
                                                                : format(
                                                                      new Date(
                                                                          folder.metadata.modified
                                                                      ),
                                                                      'MMM d, y, h:mm b'
                                                                  )}
                                                        </td>
                                                        <td className='hidden py-2 text-sm md:table-cell'>
                                                            -
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    )}
                                </table>
                            </ScrollArea.Viewport>
                        </ContextMenu.Trigger>
                        <DriveContextMenu items={menuItems} />
                    </ContextMenu.Root>
                    <ScrollArea.Scrollbar
                        className='duration-[160ms] flex touch-none select-none bg-gray-200 p-0.5 transition-colors ease-out hover:bg-gray-400 data-[orientation=horizontal]:h-2.5 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col'
                        orientation='vertical'>
                        <ScrollArea.Thumb className="relative flex-1 rounded-[10px] bg-gray-500 before:absolute before:top-1/2 before:left-1/2 before:h-full before:min-h-[44px] before:w-full before:min-w-[44px] before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']" />
                    </ScrollArea.Scrollbar>
                    <ScrollArea.Scrollbar
                        className='duration-[160ms] flex touch-none select-none bg-gray-200 p-0.5 transition-colors ease-out hover:bg-gray-400 data-[orientation=horizontal]:h-2.5 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col'
                        orientation='horizontal'>
                        <ScrollArea.Thumb className="relative flex-1 rounded-[10px] bg-gray-500 before:absolute before:top-1/2 before:left-1/2 before:h-full before:min-h-[44px] before:w-full before:min-w-[44px] before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']" />
                    </ScrollArea.Scrollbar>
                    <ScrollArea.Corner className='bg-gray-500' />
                </ScrollArea.Root>
            </div>
        </div>
    );
}

export default Drive;
