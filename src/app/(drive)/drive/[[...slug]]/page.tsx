'use client';

import { useAlertStore } from '@/lib/components/alert';
import { NodeDetails } from '@/lib/components/drive/node-details';
import { UploadProgressBox } from '@/lib/components/drive/upload-progress';
import { FullscreenUpload } from '@/lib/components/fullscreen-upload';
import { Toolbar } from '@/lib/components/toolbar';
import { apiRoutes, clientRoutes } from '@/lib/data/routes';
import { deleteFolder, list } from '@/lib/services/drive';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Float } from '@headlessui-float/react';
import { Menu } from '@headlessui/react';
import { PencilIcon } from '@heroicons/react/24/outline';
import { useMutation, useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { format, isToday } from 'date-fns';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FileWithPath, useDropzone } from 'react-dropzone';
import {
    ArrowDown,
    Copy,
    Download,
    Folder,
    Info,
    Loader,
    Menu as MenuIcon,
    Move,
    Star,
    Trash,
} from 'react-feather';

const Drive = ({ params: { slug } }: { params: { slug?: string[] } }) => {
    const currentFolder = slug?.at(0);

    const url = currentFolder
        ? `${apiRoutes.drive.list}?folderId=${currentFolder}`
        : apiRoutes.drive.list;

    const accessToken = useAuthStore(state => state.accessToken)!;
    const masterKey = useAuthStore(state => state.masterKey)!;

    const { data, status, refetch } = useQuery([url], () =>
        list(url, accessToken, masterKey)
    );

    const currentFolderQuery = useQuery(
        ['currentFolder'],
        () => currentFolder ?? null
    );
    useEffect(() => {
        currentFolderQuery.refetch();
    }, [currentFolder, currentFolderQuery]);

    const onDrop = useCallback(
        (acceptedFiles: FileWithPath[]) => acceptedFiles.forEach(_file => {}),
        []
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: true,
        noClick: true,
        noKeyboard: true,
    });

    const inputProps = useMemo(() => getInputProps(), [getInputProps]);

    const [showDetails, setShowDetails] = useState(false);
    const [nodeId, setNodeId] = useState<string>();

    const addAlert = useAlertStore(state => state.addAlert);
    const mutation = useMutation({
        mutationKey: [],
        mutationFn: async (id: string) => {
            await deleteFolder(
                `${apiRoutes.drive.deleteFolder}/${id}`,
                accessToken
            );
        },
        onSuccess: () => {
            addAlert('Folder deleted!', 'info');
            refetch();
        },
    });

    return (
        <div className='h-full' {...getRootProps()}>
            <FullscreenUpload
                isDragActive={isDragActive}
                inputProps={inputProps}
            />

            {false && <UploadProgressBox />}

            <NodeDetails
                id={nodeId}
                show={showDetails && !!nodeId}
                close={() => setShowDetails(false)}
            />

            <div className='relative mb-4 min-h-full rounded-lg bg-white p-4 shadow-md lg:mt-4 lg:mb-8'>
                <Toolbar />

                {status === 'error' && (
                    <div className='h-full w-full text-red-600'>Error</div>
                )}

                {status === 'loading' && (
                    <div className='absolute inset-0 grid place-items-center'>
                        <Loader
                            size={32}
                            className='animate-spin stroke-brand-600'
                        />
                    </div>
                )}

                <div className='hidden h-full overflow-x-auto lg:block'>
                    <table className='w-full divide-y divide-gray-300'>
                        <thead className='select-none'>
                            <tr>
                                <th
                                    scope='col'
                                    className='w-16 py-3 text-center text-gray-900'>
                                    <label
                                        className='sr-only'
                                        htmlFor='SelectAllOrNone'>
                                        Select All
                                    </label>
                                    <input
                                        type='checkbox'
                                        className='-mt-1 rounded'
                                        id='SelectAllOrNone'
                                    />
                                </th>
                                <th
                                    scope='col'
                                    className='py-3 text-left text-sm font-semibold text-gray-900'>
                                    <div className='flex cursor-pointer items-center gap-1'>
                                        <span>Name</span>
                                        <ArrowDown className='h-4' />
                                    </div>
                                </th>
                                <th
                                    scope='col'
                                    className='w-16 py-3 text-sm font-semibold text-gray-900'>
                                    <Star size={20} className='mx-3' />
                                </th>
                                <th
                                    scope='col'
                                    className='w-48 py-3 text-left text-sm font-semibold text-gray-900'>
                                    <div className='flex cursor-pointer items-center gap-1'>
                                        <span>Modified</span>
                                        <ArrowDown className='h-4' />
                                    </div>
                                </th>
                                <th
                                    scope='col'
                                    className='w-40 py-3 text-left text-sm font-semibold text-gray-900'>
                                    <div className='flex cursor-pointer items-center gap-1'>
                                        <span>Size</span>
                                        <ArrowDown className='h-4' />
                                    </div>
                                </th>
                                <th
                                    scope='col'
                                    className='w-16 text-left 2xl:w-12'>
                                    <span className='sr-only'>Actions</span>
                                </th>
                            </tr>
                        </thead>
                        {status === 'success' && (
                            <tbody className='divide-y divide-gray-200'>
                                {data.folders.map(folder => (
                                    <tr
                                        key={folder.id}
                                        className='bg-white text-gray-900 hover:bg-gray-200'>
                                        <td className='py-3 text-center'>
                                            <label
                                                className='sr-only'
                                                htmlFor='checkbox'>
                                                Select
                                            </label>
                                            <input
                                                className='-mt-1 rounded'
                                                type='checkbox'
                                                id='checkbox'
                                            />
                                        </td>
                                        <td className='max-w-[300px] whitespace-nowrap py-3 text-left'>
                                            <div className='flex items-center gap-2'>
                                                <Folder
                                                    className='shrink-0 fill-brand-600 text-brand-600'
                                                    size={16}
                                                />
                                                <Link
                                                    href={`${clientRoutes.drive.index}/${folder.id}`}
                                                    className='truncate text-sm'>
                                                    {folder.metadata.name}
                                                </Link>
                                            </div>
                                        </td>
                                        <td
                                            className='py-3 text-sm text-gray-500'
                                            title='Toggle Starred'>
                                            <button type='button'>
                                                <Star
                                                    size={20}
                                                    className={clsx(
                                                        'mx-3 cursor-pointer',
                                                        true
                                                            ? 'fill-yellow-500 text-yellow-500'
                                                            : 'fill-none'
                                                    )}
                                                />
                                            </button>
                                        </td>
                                        <td className='py-3 text-left text-sm'>
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
                                        <td className='py-3 text-left text-sm'>
                                            -
                                        </td>
                                        <td className='py-3 text-left'>
                                            <Menu>
                                                <Float
                                                    flip
                                                    offset={6}
                                                    zIndex={10}
                                                    strategy='fixed'
                                                    enter='transition duration-100 ease-out'
                                                    enterFrom='transform scale-95 opacity-0'
                                                    enterTo='transform scale-100 opacity-100'
                                                    leave='transition duration-75 ease-out'
                                                    leaveFrom='transform scale-100 opacity-100'
                                                    leaveTo='transform scale-95 opacity-0'>
                                                    <Menu.Button className='px-3 2xl:px-1'>
                                                        <span className='sr-only'>
                                                            Menu
                                                        </span>
                                                        <MenuIcon
                                                            size={16}
                                                            className='cursor-pointer'
                                                        />
                                                    </Menu.Button>
                                                    <Menu.Items className='mr-1 flex w-36 flex-col items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg focus:outline-none'>
                                                        <Menu.Item
                                                            as='button'
                                                            className='flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium ui-active:bg-brand-600 ui-active:text-white ui-not-active:bg-white ui-not-active:text-gray-900'>
                                                            <PencilIcon className='h-4 w-4' />
                                                            <span>Rename</span>
                                                        </Menu.Item>
                                                        <Menu.Item
                                                            as='button'
                                                            className='flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium ui-active:bg-brand-600 ui-active:text-white ui-not-active:bg-white ui-not-active:text-gray-900'>
                                                            <Copy size={16} />
                                                            <span>Copy</span>
                                                        </Menu.Item>
                                                        <Menu.Item
                                                            as='button'
                                                            className='flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium ui-active:bg-brand-600 ui-active:text-white ui-not-active:bg-white ui-not-active:text-gray-900'>
                                                            <Move size={16} />
                                                            <span>Move</span>
                                                        </Menu.Item>
                                                        <Menu.Item
                                                            as='button'
                                                            onClick={() => {
                                                                setNodeId(
                                                                    folder.id
                                                                );
                                                                setShowDetails(
                                                                    true
                                                                );
                                                            }}
                                                            className='flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium ui-active:bg-brand-600 ui-active:text-white ui-not-active:bg-white ui-not-active:text-gray-900'>
                                                            <Info size={16} />
                                                            <span>Details</span>
                                                        </Menu.Item>
                                                        <Menu.Item
                                                            as='button'
                                                            className='flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium ui-active:bg-brand-600 ui-active:text-white ui-not-active:bg-white ui-not-active:text-gray-900'>
                                                            <Download
                                                                size={16}
                                                            />
                                                            <span>
                                                                Download
                                                            </span>
                                                        </Menu.Item>
                                                        <Menu.Item
                                                            as='button'
                                                            onClick={() =>
                                                                mutation.mutate(
                                                                    folder.id
                                                                )
                                                            }
                                                            className='flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium ui-active:bg-red-600 ui-active:text-white ui-not-active:bg-white ui-not-active:text-gray-900'>
                                                            <Trash size={16} />
                                                            <span>Delete</span>
                                                        </Menu.Item>
                                                    </Menu.Items>
                                                </Float>
                                            </Menu>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        )}
                    </table>
                </div>

                <div className='grid grid-cols-1 gap-2 py-4 lg:hidden'>
                    {data?.folders.map(folder => (
                        <div
                            key={folder.id}
                            title={folder.metadata.name}
                            className='flex cursor-pointer items-center justify-between gap-2 whitespace-nowrap rounded-lg border p-4 py-3 text-gray-900'>
                            <div className='flex items-center gap-2'>
                                <Folder
                                    size={24}
                                    className='fill-brand-600 text-brand-600'
                                />

                                <span className='w-44 truncate text-sm font-medium sm:w-96'>
                                    {folder.metadata.name}
                                </span>
                            </div>
                            <div>
                                <Menu>
                                    <Float
                                        offset={6}
                                        flip
                                        strategy='fixed'
                                        enter='transition duration-100 ease-out'
                                        enterFrom='transform scale-95 opacity-0'
                                        enterTo='transform scale-100 opacity-100'
                                        leave='transition duration-75 ease-out'
                                        leaveFrom='transform scale-100 opacity-100'
                                        leaveTo='transform scale-95 opacity-0'>
                                        <Menu.Button>
                                            <span className='sr-only'>
                                                Menu
                                            </span>
                                            <MenuIcon
                                                size={16}
                                                className='cursor-pointer'
                                            />
                                        </Menu.Button>
                                        <Menu.Items className='flex w-40 flex-col items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg focus:outline-none'>
                                            <Menu.Item
                                                as='button'
                                                className='w-full px-3 py-2 text-left text-sm font-medium ui-active:bg-brand-600 ui-active:text-white ui-not-active:bg-white ui-not-active:text-gray-900'>
                                                Rename
                                            </Menu.Item>
                                            <Menu.Item
                                                as='button'
                                                className='w-full px-3 py-2 text-left text-sm font-medium ui-active:bg-brand-600 ui-active:text-white ui-not-active:bg-white ui-not-active:text-gray-900'>
                                                Copy
                                            </Menu.Item>
                                            <Menu.Item
                                                as='button'
                                                className='w-full px-3 py-2 text-left text-sm font-medium ui-active:bg-brand-600 ui-active:text-white ui-not-active:bg-white ui-not-active:text-gray-900'>
                                                Move
                                            </Menu.Item>
                                            <Menu.Item
                                                as='button'
                                                onClick={() => {
                                                    setNodeId(folder.id);
                                                    setShowDetails(true);
                                                }}
                                                className='w-full px-3 py-2 text-left text-sm font-medium ui-active:bg-brand-600 ui-active:text-white ui-not-active:bg-white ui-not-active:text-gray-900'>
                                                Details
                                            </Menu.Item>
                                            <Menu.Item
                                                as='button'
                                                className='w-full px-3 py-2 text-left text-sm font-medium ui-active:bg-brand-600 ui-active:text-white ui-not-active:bg-white ui-not-active:text-gray-900'>
                                                Download
                                            </Menu.Item>
                                            <Menu.Item
                                                as='button'
                                                onClick={() =>
                                                    mutation.mutate(folder.id)
                                                }
                                                className='w-full px-3 py-2 text-left text-sm font-medium ui-active:bg-red-600 ui-active:text-white ui-not-active:bg-white ui-not-active:text-gray-900'>
                                                Delete
                                            </Menu.Item>
                                        </Menu.Items>
                                    </Float>
                                </Menu>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Drive;
