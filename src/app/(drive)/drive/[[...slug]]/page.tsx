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
import { Icon } from '@fluentui/react/lib/Icon';
import * as ContextMenu from '@radix-ui/react-context-menu';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
    getFileTypeIconProps,
    initializeFileTypeIcons,
} from '@uifabric/file-type-icons';
import { downloadZip } from 'client-zip';
import { format, isToday } from 'date-fns';
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
import { FileWithPath, useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import useMeasure from 'react-use-measure';

import Breadcrumbs from '@/lib/components/drive/breadcrumbs';
import { DriveContextMenu } from '@/lib/components/drive/context-menu';
import { NewFolderDialog } from '@/lib/components/drive/new-folder-dialog';
import { RenameDialog } from '@/lib/components/drive/rename-dialog';
import { DriveToolbar } from '@/lib/components/drive/toolbar';
import { MenuItem, MenuSeparator } from '@/lib/components/drive/types/menu';
import { UploadProgressBox } from '@/lib/components/drive/upload-progress';
import { FullscreenUpload } from '@/lib/components/fullscreen-upload';
import { apiRoutes, clientRoutes } from '@/lib/data/routes';
import { useClickDirect } from '@/lib/hooks/use-click-direct';
import CryptoWorker from '@/lib/services/comlink-crypto';
import {
    BreadcrumbDecrypted,
    FileMetadata,
    FileNodeDecrypted,
    FolderMetadata,
    FolderNodeDecrypted,
    deleteNodes,
    list,
} from '@/lib/services/drive';
import { useAuthStore } from '@/lib/stores/auth-store';
import { FileWithVersion, useUploadStore } from '@/lib/stores/upload-store';
import { cn } from '@/lib/utils/cn';
import humanFileSize from '@/lib/utils/humanizedFileSize';
import { streamSaver } from '@/lib/utils/stream-saver';
import StreamSlicer, { StreamDecrypter } from '@/lib/utils/stream-slicer';

initializeFileTypeIcons();

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
        (acceptedFiles: FileWithPath[]) => {
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

            queueForUpload(
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

    const downloadFile = async (node: FileNodeDecrypted) => {
        const responseStream = await fetch(node.fileUrl);
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
                evt.returnValue = `Are you sure you want to leave?`;
            }
        };

        try {
            await responseStream.body
                .pipeThrough(new TransformStream(new StreamSlicer()))
                .pipeThrough(
                    new TransformStream(new StreamDecrypter(node.fileKey))
                )
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
                input: await fetch(node.fileUrl).then(response => {
                    if (!response.body) {
                        return response;
                    }
                    return response.body
                        .pipeThrough(new TransformStream(new StreamSlicer()))
                        .pipeThrough(
                            new TransformStream(
                                new StreamDecrypter(node.fileKey)
                            )
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
                evt.returnValue = `Are you sure you want to leave?`;
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
            {
                type: 'separator',
                id: '1',
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

    const folders = useMemo(
        () =>
            data
                ? orderBy(
                      data.folders,
                      f =>
                          Object.keys(f.metadata).includes(sortKey)
                              ? f.metadata[sortKey as keyof FolderMetadata]
                              : f.metadata.name,
                      [sortOrder]
                  )
                : [],
        [data, sortKey, sortOrder]
    );

    const files = useMemo(
        () =>
            data
                ? orderBy(
                      data.files,
                      f =>
                          Object.keys(f.metadata).includes(sortKey)
                              ? f.metadata[sortKey as keyof FileMetadata]
                              : f.metadata.name,
                      [sortOrder]
                  )
                : [],
        [data, sortKey, sortOrder]
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
                                currentFolderKey={currentFolderKey}
                            />
                        )}
                    </div>

                    <div className='w-screen'>
                        <DriveToolbar items={menuItems} />

                        <Breadcrumbs
                            items={
                                data?.breadcrumbs ??
                                ([] as BreadcrumbDecrypted[])
                            }
                        />
                    </div>
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
                                                                <Folder className='h-5 w-5 shrink-0 fill-brand-600 text-brand-600' />
                                                                <Link
                                                                    onClick={e =>
                                                                        e.stopPropagation()
                                                                    }
                                                                    href={`${clientRoutes.drive}/${folder.id}`}
                                                                    className='max-w-[8rem] truncate text-sm md:max-w-full'>
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
                                            {files.map(file => {
                                                const isSelected =
                                                    selectedNodes.findIndex(
                                                        n =>
                                                            n.node.id ===
                                                            file.id
                                                    ) >= 0;

                                                return (
                                                    <tr
                                                        key={file.id}
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
                                                                                file.id
                                                                        );
                                                                    }

                                                                    return [
                                                                        ...prev,
                                                                        {
                                                                            node: file as FileNodeDecrypted,
                                                                            type: 'file',
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
                                                                            node: file as FileNodeDecrypted,
                                                                            type: 'file',
                                                                        },
                                                                    ];
                                                                }
                                                            )
                                                        }>
                                                        <td className='py-2 text-center'>
                                                            <label
                                                                htmlFor={`checkbox-${file.id}`}
                                                                className='sr-only'>
                                                                Select
                                                            </label>
                                                            <input
                                                                onClick={e =>
                                                                    e.stopPropagation()
                                                                }
                                                                onChange={() =>
                                                                    selectNode(
                                                                        file,
                                                                        'file'
                                                                    )
                                                                }
                                                                checked={
                                                                    isSelected
                                                                }
                                                                className='-mt-1 cursor-pointer rounded'
                                                                type='checkbox'
                                                                id={`checkbox-${file.id}`}
                                                            />
                                                        </td>
                                                        <td className='max-w-[300px] whitespace-nowrap py-2 text-left'>
                                                            <div className='flex items-center gap-2'>
                                                                <Icon
                                                                    className='h-5 w-5 shrink-0'
                                                                    {...getFileTypeIconProps(
                                                                        {
                                                                            extension:
                                                                                file.metadata.name
                                                                                    .split(
                                                                                        '.'
                                                                                    )
                                                                                    .at(
                                                                                        -1
                                                                                    ),
                                                                        }
                                                                    )}
                                                                />
                                                                <span className='max-w-[8rem] truncate text-sm md:max-w-full'>
                                                                    {
                                                                        file
                                                                            .metadata
                                                                            .name
                                                                    }
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className='py-2 text-left text-sm'>
                                                            {isToday(
                                                                new Date(
                                                                    file.metadata.modified
                                                                )
                                                            )
                                                                ? format(
                                                                      new Date(
                                                                          file.metadata.modified
                                                                      ),
                                                                      'h:mm:ss b'
                                                                  )
                                                                : format(
                                                                      new Date(
                                                                          file.metadata.modified
                                                                      ),
                                                                      'MMM d, y, h:mm b'
                                                                  )}
                                                        </td>
                                                        <td className='hidden py-2 text-sm md:table-cell'>
                                                            {humanFileSize(
                                                                file.metadata
                                                                    .size,
                                                                true
                                                            )}
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
    );
}

export default Drive;
