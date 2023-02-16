'use client';

import { UploadProgressBox } from '@/lib/components/drive/upload-progress';
import { FullscreenUpload } from '@/lib/components/fullscreen-upload';
import { apiRoutes, clientRoutes } from '@/lib/data/routes';
import { deleteFolder, list } from '@/lib/services/drive';
import { useAlertStore } from '@/lib/stores/alert-store';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Float } from '@headlessui-float/react';
import { Menu } from '@headlessui/react';
import { PencilIcon } from '@heroicons/react/24/outline';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { useMutation, useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { format, isToday } from 'date-fns';
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
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo } from 'react';
import { FileWithPath, useDropzone } from 'react-dropzone';
import useMeasure from 'react-use-measure';

const TAGS = Array.from({ length: 50 }).map(
    (_, i, a) => `v1.2.0-beta.${a.length - i}`
);

function Drive({ params: { slug } }: { params: { slug?: string[] } }) {
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

    const [ref, bounds] = useMeasure();
    const [refRest, boundsRest] = useMeasure();

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
                    <div>TODO: Toolbar</div>
                </div>

                <ScrollArea.Root
                    style={{
                        height:
                            document.body.clientHeight -
                            bounds.top -
                            boundsRest.height,
                    }}
                    className='w-full overflow-hidden'>
                    <ScrollArea.Viewport className='h-full w-full rounded'>
                        <div className='py-[15px] px-5'>
                            <div className='font-medium leading-[18px]'>
                                Tags
                            </div>
                            {TAGS.map(tag => (
                                <div
                                    className='mt-2.5 pt-2.5 text-[13px] leading-[18px]'
                                    key={tag}>
                                    {tag}
                                </div>
                            ))}
                        </div>
                    </ScrollArea.Viewport>
                    <ScrollArea.Scrollbar
                        className='flex touch-none select-none bg-blackA6 p-0.5 transition-colors duration-[160ms] ease-out hover:bg-blackA8 data-[orientation=horizontal]:h-2.5 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col'
                        orientation='vertical'>
                        <ScrollArea.Thumb className="relative flex-1 rounded-[10px] bg-mauve10 before:absolute before:top-1/2 before:left-1/2 before:h-full before:min-h-[44px] before:w-full before:min-w-[44px] before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']" />
                    </ScrollArea.Scrollbar>
                    <ScrollArea.Scrollbar
                        className='flex touch-none select-none bg-blackA6 p-0.5 transition-colors duration-[160ms] ease-out hover:bg-blackA8 data-[orientation=horizontal]:h-2.5 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col'
                        orientation='horizontal'>
                        <ScrollArea.Thumb className="relative flex-1 rounded-[10px] bg-mauve10 before:absolute before:top-1/2 before:left-1/2 before:h-full before:min-h-[44px] before:w-full before:min-w-[44px] before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']" />
                    </ScrollArea.Scrollbar>
                    <ScrollArea.Corner className='bg-blackA8' />
                </ScrollArea.Root>

                <table className='hidden h-full w-full divide-y divide-gray-300'>
                    <div>
                        Lorem ipsum dolor sit amet consectetur adipisicing elit.
                        Dolorum similique qui magnam voluptas nemo deserunt
                        praesentium, in incidunt, recusandae totam quo, odio
                        impedit at. Harum necessitatibus assumenda quasi culpa
                        nam?
                    </div>
                    <div>
                        Lorem ipsum dolor sit amet consectetur adipisicing elit.
                        Dolorum similique qui magnam voluptas nemo deserunt
                        praesentium, in incidunt, recusandae totam quo, odio
                        impedit at. Harum necessitatibus assumenda quasi culpa
                        nam?
                    </div>
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
                            <th scope='col' className='w-16 text-left 2xl:w-12'>
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
                                                    !folder.id
                                                        ? 'fill-yellow-500 text-yellow-500'
                                                        : 'fill-none'
                                                )}
                                            />
                                        </button>
                                    </td>
                                    <td className='py-3 text-left text-sm'>
                                        {isToday(
                                            new Date(folder.metadata.modified)
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
                                                        onClick={() => {}}
                                                        className='flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium ui-active:bg-brand-600 ui-active:text-white ui-not-active:bg-white ui-not-active:text-gray-900'>
                                                        <Info size={16} />
                                                        <span>Details</span>
                                                    </Menu.Item>
                                                    <Menu.Item
                                                        as='button'
                                                        className='flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium ui-active:bg-brand-600 ui-active:text-white ui-not-active:bg-white ui-not-active:text-gray-900'>
                                                        <Download size={16} />
                                                        <span>Download</span>
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
        </div>
    );
}

export default Drive;
