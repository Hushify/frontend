'use client';

import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import Image from 'next/image';
import * as ContextMenu from '@radix-ui/react-context-menu';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { useMutation } from '@tanstack/react-query';
import { initializeFileTypeIcons } from '@uifabric/file-type-icons';
import { downloadZip } from 'client-zip';
import { orderBy } from 'lodash';
import {
    ChevronUp,
    ChevronsUpDown,
    Download,
    Folder,
    Loader,
    Pencil,
    Plus,
    Trash2,
    Upload,
} from 'lucide-react';
import { HTML5toTouch } from 'rdndmb-html5-to-touch';
import { DndProvider } from 'react-dnd-multi-backend';
import { FileWithPath, useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import useMeasure from 'react-use-measure';

import undrawFileManager from '@/lib/assets/undraw_file_manager.svg';
import Breadcrumbs from '@/lib/components/drive/breadcrumbs';
import { DriveContextMenu } from '@/lib/components/drive/context-menu';
import { DragPreview } from '@/lib/components/drive/drag-preview';
import { FileRow } from '@/lib/components/drive/file-row';
import { FolderRow } from '@/lib/components/drive/folder-row';
import { NewFolderDialog } from '@/lib/components/drive/new-folder-dialog';
import { RenameDialog } from '@/lib/components/drive/rename-dialog';
import { DriveToolbar } from '@/lib/components/drive/toolbar';
import { MenuItem, MenuSeparator } from '@/lib/components/drive/types/menu';
import { UploadProgressBox } from '@/lib/components/drive/upload-progress';
import { FullscreenUpload } from '@/lib/components/fullscreen-upload';
import { useClickDirect } from '@/lib/hooks/use-click-direct';
import { useDriveList } from '@/lib/hooks/use-drive-list';
import { useMoveNodes } from '@/lib/hooks/use-move-nodes';
import {
    BreadcrumbDecrypted,
    FileMetadata,
    FileNodeDecrypted,
    FolderMetadata,
    FolderNodeDecrypted,
    deleteNodes,
} from '@/lib/services/drive';
import { useAuthStore } from '@/lib/stores/auth-store';
import { FileWithVersion, useUploadStore } from '@/lib/stores/upload-store';
import { cn } from '@/lib/utils/cn';
import { streamSaver } from '@/lib/utils/stream-saver';
import StreamSlicer, { StreamDecrypter } from '@/lib/utils/stream-slicer';

initializeFileTypeIcons();

function Drive({ params: { slug } }: { params: { slug?: string[] } }) {
    const accessToken = useAuthStore(state => state.accessToken)!;
    const masterKey = useAuthStore(state => state.masterKey)!;

    const currentFolderId = slug?.at(0) ?? null;

    const { data, status, refetch } = useDriveList(
        currentFolderId,
        accessToken,
        masterKey
    );

    const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
    const [isRenameOpen, setIsRenameOpen] = useState(false);

    const currentFolderKey = useMemo(
        () =>
            data && data.breadcrumbs.length > 0
                ? data?.breadcrumbs.find(c => c.id === currentFolderId)?.key ??
                  masterKey
                : masterKey,
        [currentFolderId, data, masterKey]
    );

    const queueForUpload = useUploadStore(state => state.queueForUpload);

    const onDrop = useCallback(
        async (acceptedFiles: FileWithPath[]) => {
            if (!data) {
                return;
            }

            // type Folder = {
            //     name: string;
            //     key: string | null;
            // };

            // type Subfolder = {
            //     name: string;
            //     key: string | null;
            //     children: Subfolder[];
            // };

            // const folderMap = new Map<Folder, Subfolder>();

            // acceptedFiles.forEach(f => {
            //     if (!f.path || !f.path.includes('/')) {
            //         return;
            //     }

            //     // remove file name, split path and set folderMap with children
            //     const path = f.path.slice(0, f.path.lastIndexOf('/')).slice(1);
            //     const pathArray = path.split('/');
            //     const folderName = pathArray[0];
            //     const folderKey =
            //         data.folders.find(f => f.metadata.name === folderName)
            //             ?.folderKey ?? null;

            //     const folder: Folder = {
            //         name: folderName,
            //         key: folderKey,
            //     };

            //     const subfolder: Subfolder = {
            //         name: pathArray[1],
            //         key: null,
            //         children: [],
            //     };

            //     if (folderMap.has(folder)) {
            //         folderMap.get(folder)?.children.push(subfolder);
            //     } else {
            //         folderMap.set(folder, subfolder);
            //     }
            // });

            // console.log(folderMap);

            // return;

            // for (const [key, _] of folderMap) {
            //     const folder = data.folders.find(
            //         f =>
            //             key.slice(
            //                 0,
            //                 key.includes('/') ? key.indexOf('/') : undefined
            //             ) === f.metadata.name
            //     );

            //     if (folder) {
            //         toast.error(
            //             'Folder with the same name already exists. Please rename the folder and try again.'
            //         );
            //         return;
            //     }
            // }

            const files: FileWithVersion[] = acceptedFiles.map(file => ({
                file,
                previousVersionId: data.files.find(
                    f => f.metadata.name === file.name
                )?.id,
            }));

            await queueForUpload(
                // folderMap,
                files,
                data.currentFolderId,
                currentFolderKey,
                accessToken,
                refetch
            );
        },
        [accessToken, currentFolderKey, data, queueForUpload, refetch]
    );

    const {
        getRootProps,
        getInputProps,
        isDragActive,
        inputRef: fileRef,
    } = useDropzone({
        onDrop,
        multiple: true,
        noClick: true,
        noKeyboard: true,
    });

    const { getInputProps: getFolderInputProps, inputRef: folderRef } =
        useDropzone({
            onDrop,
            multiple: true,
            noClick: true,
            noKeyboard: true,
            noDrag: true,
        });

    const inputProps = useMemo(getInputProps, [getInputProps]);

    const [ref, bounds] = useMeasure();
    const [refRest, boundsRest] = useMeasure();

    const selectAllRef = useRef<HTMLInputElement>(null);

    const [selectedNodes, setSelectedNodes] = useState<
        (
            | { node: FolderNodeDecrypted; type: 'folder' }
            | { node: FileNodeDecrypted; type: 'file' }
        )[]
    >([]);

    useEffect(() => {
        setSelectedNodes([]);
    }, [currentFolderId]);

    const selectAll = useCallback(() => {
        if (!selectAllRef.current) {
            return null;
        }

        if (!data) {
            return null;
        }

        if (!selectAllRef.current.checked) {
            setSelectedNodes([]);
            return null;
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
                        {
                            node: node as FolderNodeDecrypted,
                            type: 'folder',
                        },
                    ];
                }

                return [
                    ...prev,
                    {
                        node: node as FileNodeDecrypted,
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
            clearSelection();
            refetch();
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

    const downloadFile = async (node: FileNodeDecrypted) => {
        const responseStream = await fetch(node.url);
        if (!responseStream.body) {
            return;
        }

        const stream = streamSaver.createWriteStream(node.metadata.name, {
            size: node.metadata.size,
        });

        window.onunload = () => {
            stream.abort();
        };

        let done = false;

        window.onbeforeunload = evt => {
            if (!done) {
                evt.returnValue = `Download in progress. Are you sure you want to leave?`;
            }
        };

        try {
            await responseStream.body
                .pipeThrough(new TransformStream(new StreamSlicer()))
                .pipeThrough(new TransformStream(new StreamDecrypter(node.key)))
                .pipeTo(stream);
        } catch (error) {
            throw error;
        } finally {
            done = true;
        }
    };

    async function* downloadGenerator(nodes: FileNodeDecrypted[]) {
        for (const node of nodes)
            yield {
                input: await fetch(node.url).then(response => {
                    if (!response.body) {
                        return response;
                    }
                    return response.body
                        .pipeThrough(new TransformStream(new StreamSlicer()))
                        .pipeThrough(
                            new TransformStream(new StreamDecrypter(node.key))
                        );
                }),
                name: node.metadata.name,
            };
    }

    const downloadMultiple = useCallback(async () => {
        const zip = downloadZip(
            downloadGenerator(
                selectedNodes
                    .filter(f => f.type === 'file')
                    .map(f => f.node as FileNodeDecrypted)
            )
        );

        const stream = streamSaver.createWriteStream('download.zip');

        window.onunload = () => {
            stream.abort();
        };

        let done = false;

        window.onbeforeunload = evt => {
            if (!done) {
                evt.returnValue = `Download in progress. Are you sure you want to leave?`;
            }
        };

        if (!zip.body) {
            done = true;
            throw new Error('Download failed!');
        }

        try {
            await zip.body.pipeTo(stream);
        } catch (error) {
            throw error;
        } finally {
            done = true;
        }
    }, [selectedNodes]);

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
                            downloadFile(
                                selectedNodes[0].node as FileNodeDecrypted
                            ),
                            {
                                success: 'Downloaded!',
                                error: 'Download failed!',
                                loading: 'Downloading...',
                            }
                        );
                    } else {
                        await toast.promise(downloadMultiple(), {
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

        items.push({
            type: 'separator',
            id: '1',
        });

        items.push({
            type: 'item',
            name: 'Delete',
            action: () =>
                toast.promise(
                    deleteNodesMutation.mutateAsync({
                        folderIds: selectedNodes
                            .filter(n => n.type === 'folder')
                            .map(n => n.node.id),
                        fileIds: selectedNodes
                            .filter(n => n.type === 'file')
                            .map(n => n.node.id),
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
        deleteNodesMutation,
        downloadMultiple,
        fileRef,
        folderRef,
        selectedNodes,
    ]);

    const [sortKey, setSortKey] = useState<
        keyof FolderMetadata | keyof FileMetadata
    >('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const folders = useMemo(() => {
        if (!data) {
            return [];
        }
        if (sortKey === 'name') {
            return data.folders.sort((a, b) => {
                return (
                    a.metadata.name.localeCompare(b.metadata.name, 'en', {
                        numeric: true,
                    }) * (sortOrder === 'asc' ? 1 : -1)
                );
            });
        }
        return orderBy(
            data.folders,
            f =>
                Object.keys(f.metadata).includes(sortKey)
                    ? f.metadata[sortKey as keyof FolderMetadata]
                    : f.metadata.name,
            [sortOrder]
        );
    }, [data, sortKey, sortOrder]);

    const files = useMemo(() => {
        if (!data) {
            return [];
        }

        if (sortKey === 'name') {
            return data.files.sort((a, b) => {
                return (
                    a.metadata.name.localeCompare(b.metadata.name, 'en', {
                        numeric: true,
                    }) * (sortOrder === 'asc' ? 1 : -1)
                );
            });
        }
        return orderBy(
            data.files,
            f =>
                Object.keys(f.metadata).includes(sortKey)
                    ? f.metadata[sortKey as keyof FileMetadata]
                    : f.metadata.name,
            [sortOrder]
        );
    }, [data, sortKey, sortOrder]);

    const divRef = useRef<HTMLDivElement>(null);
    const clearSelection = useCallback(() => setSelectedNodes([]), []);
    useClickDirect(divRef, clearSelection);
    const moveMutation = useMoveNodes(
        currentFolderId,
        accessToken,
        clearSelection
    );

    return (
        <DndProvider
            options={{
                backends: HTML5toTouch.backends.map(backend => {
                    backend.preview = true;
                    return backend;
                }),
            }}>
            <div className='h-full w-full' {...getRootProps()}>
                <FullscreenUpload
                    isDragActive={isDragActive}
                    inputProps={inputProps}
                />

                <input
                    {...getFolderInputProps()}
                    // @ts-expect-error
                    webkitdirectory=''
                    mozdirectory=''
                    nwdirectory=''
                    directory=''
                />

                <UploadProgressBox />

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
                                folders={data?.folders}
                                currentFolderId={currentFolderId}
                                currentFolderKey={currentFolderKey}
                                isNewFolderOpen={isNewFolderOpen}
                                setIsNewFolderOpen={setIsNewFolderOpen}
                            />

                            {selectedNodes.length === 1 && (
                                <RenameDialog
                                    nodes={
                                        selectedNodes.at(0)!.type === 'folder'
                                            ? folders
                                            : files
                                    }
                                    type={selectedNodes.at(0)!.type}
                                    node={selectedNodes.at(0)!.node}
                                    isRenameOpen={isRenameOpen}
                                    setIsRenameOpen={setIsRenameOpen}
                                    currentFolderId={currentFolderId}
                                    onSuccess={clearSelection}
                                />
                            )}
                        </div>

                        <DriveToolbar items={menuItems} />

                        <Breadcrumbs
                            items={
                                data?.breadcrumbs ??
                                ([] as BreadcrumbDecrypted[])
                            }
                            workspaceId={data?.workspaceFolderId}
                            onMove={moveMutation.mutateAsync}
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
                                                                sortKey ===
                                                                'name'
                                                            ) {
                                                                setSortOrder(
                                                                    prev =>
                                                                        prev ===
                                                                        'asc'
                                                                            ? 'desc'
                                                                            : 'asc'
                                                                );
                                                            } else {
                                                                setSortKey(
                                                                    'name'
                                                                );
                                                                setSortOrder(
                                                                    'asc'
                                                                );
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
                                                                setSortOrder(
                                                                    prev =>
                                                                        prev ===
                                                                        'asc'
                                                                            ? 'desc'
                                                                            : 'asc'
                                                                );
                                                            } else {
                                                                setSortKey(
                                                                    'modified'
                                                                );
                                                                setSortOrder(
                                                                    'asc'
                                                                );
                                                            }
                                                        }}
                                                        className='flex items-center gap-1'>
                                                        <span>Modified</span>
                                                        {sortKey ===
                                                        'modified' ? (
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
                                                                sortKey ===
                                                                'size'
                                                            ) {
                                                                setSortOrder(
                                                                    prev =>
                                                                        prev ===
                                                                        'asc'
                                                                            ? 'desc'
                                                                            : 'asc'
                                                                );
                                                            } else {
                                                                setSortKey(
                                                                    'size'
                                                                );
                                                                setSortOrder(
                                                                    'asc'
                                                                );
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
                                        {status === 'success' &&
                                            data.folders.length === 0 &&
                                            data.files.length === 0 && (
                                                <tbody>
                                                    <tr>
                                                        <td colSpan={10}>
                                                            <div className='absolute inset-0 flex select-none items-center justify-center'>
                                                                <Image
                                                                    draggable={
                                                                        false
                                                                    }
                                                                    className='w-1/2 xl:w-1/3'
                                                                    src={
                                                                        undrawFileManager
                                                                    }
                                                                    alt='File Manager'
                                                                />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            )}
                                        {status === 'success' &&
                                            (data.folders.length ||
                                                data.files.length > 0) > 0 && (
                                                <tbody className='divide-y divide-gray-200'>
                                                    {folders.map(folder => (
                                                        <FolderRow
                                                            key={folder.id}
                                                            selectNode={
                                                                selectNode
                                                            }
                                                            folder={folder}
                                                            selectedNodes={
                                                                selectedNodes
                                                            }
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
                                                            selectNode={
                                                                selectNode
                                                            }
                                                            file={file}
                                                            selectedNodes={
                                                                selectedNodes
                                                            }
                                                            setSelectedNodes={
                                                                setSelectedNodes
                                                            }
                                                        />
                                                    ))}
                                                </tbody>
                                            )}
                                    </table>
                                </ScrollArea.Viewport>
                            </ContextMenu.Trigger>
                            <DriveContextMenu items={menuItems} />
                        </ContextMenu.Root>
                        <ScrollArea.Scrollbar
                            className='flex touch-none select-none bg-gray-200 p-0.5 transition-colors duration-150 ease-out hover:bg-gray-400 data-[orientation=horizontal]:h-2.5 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col'
                            orientation='vertical'>
                            <ScrollArea.Thumb className="relative flex-1 rounded-[10px] bg-gray-500 before:absolute before:top-1/2 before:left-1/2 before:h-full before:min-h-[44px] before:w-full before:min-w-[44px] before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']" />
                        </ScrollArea.Scrollbar>
                        <ScrollArea.Scrollbar
                            className='flex touch-none select-none bg-gray-200 p-0.5 transition-colors duration-150 ease-out hover:bg-gray-400 data-[orientation=horizontal]:h-2.5 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col'
                            orientation='horizontal'>
                            <ScrollArea.Thumb className="relative flex-1 rounded-[10px] bg-gray-500 before:absolute before:top-1/2 before:left-1/2 before:h-full before:min-h-[44px] before:w-full before:min-w-[44px] before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']" />
                        </ScrollArea.Scrollbar>
                        <ScrollArea.Corner className='bg-gray-500' />
                    </ScrollArea.Root>
                </div>
            </div>
            <DragPreview />
        </DndProvider>
    );
}

export default Drive;
