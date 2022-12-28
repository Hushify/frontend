'use client';

import { NotesDialog } from '@/components/drive/file-notes';
import { UploadProgressBox } from '@/components/drive/upload-progress';
import { FullscreenUpload } from '@/components/fullscreen-upload';
import { Toolbar } from '@/components/toolbar';
import { useDriveList } from '@/hooks/use-drive-list';
import { Float } from '@headlessui-float/react';
import { Menu } from '@headlessui/react';
import clsx from 'clsx';
import { useCallback, useMemo, useState } from 'react';
import { FileWithPath, useDropzone } from 'react-dropzone';
import {
    ArrowDown,
    Folder,
    Loader,
    Menu as MenuIcon,
    Star,
} from 'react-feather';
import sanitize from 'sanitize-filename';

const fakeData = [
    {
        id: '67f6026c-1226-48f4-936b-9a2e41ec1a31',
        name: 'authorized_credit.jpg',
        size: 4421.55,
        modified: '2022-04-10T13:12:39.386Z',
        isStarred: false,
    },
    {
        id: '2890b384-b1be-4973-abb1-12ea09630fd0',
        name: 'cadillac.mp4',
        size: 24582.22,
        modified: '2022-08-20T12:41:52.148Z',
        isStarred: true,
    },
    {
        id: '63526ff8-7ec2-452b-bb09-a3db983c8019',
        name: 'bedfordshire_van_music.pdf',
        size: 76470.29,
        modified: '2022-01-27T03:30:15.650Z',
        isStarred: false,
    },
    {
        id: '7539d1b2-b94a-4370-b2b7-b2c7a4f5a9cc',
        name: 'administrator.jpg',
        size: 85716.08,
        modified: '2022-03-14T03:14:43.193Z',
        isStarred: true,
    },
    {
        id: '5053bf7c-a92e-4bba-a9ad-ea7cc9166895',
        name: 'where.mp4',
        size: 71899.18,
        modified: '2022-12-08T23:21:00.446Z',
        isStarred: true,
    },
    {
        id: '319c9eeb-974b-4459-9a37-db328d1db97c',
        name: 'networked_bicycle.gif',
        size: 80419.62,
        modified: '2022-06-29T00:39:33.251Z',
        isStarred: true,
    },
    {
        id: '1cf5c3bd-60b1-4c4d-89e7-3d99f86525c8',
        name: 'gasoline_infrastructure_bypassing.gif',
        size: 43416.1,
        modified: '2022-07-10T19:31:13.861Z',
        isStarred: true,
    },
    {
        id: 'ff8dc61a-df22-4ef9-9c02-b4bb24206a91',
        name: 'kentucky_ha.gif',
        size: 39639.54,
        modified: '2022-02-04T14:24:15.555Z',
        isStarred: true,
    },
    {
        id: '1a1a3630-0c5d-4b6d-a09b-a176ba0f186a',
        name: 'direct_b2c_wyoming.wav',
        size: 64439.4,
        modified: '2022-05-18T13:20:52.121Z',
        isStarred: false,
    },
    {
        id: '8fcc50e5-5fa9-4dce-a9c0-8f04291f21e2',
        name: 'volt.gif',
        size: 15160.53,
        modified: '2022-04-20T08:48:51.524Z',
        isStarred: true,
    },
    {
        id: '45f66519-f73b-49fb-a990-fdec7fdd7910',
        name: 'seamless_asynchronous_candela.png',
        size: 80506.69,
        modified: '2022-12-15T04:01:55.555Z',
        isStarred: true,
    },
    {
        id: 'ab410609-d23c-4043-89c1-3630a577e733',
        name: 'dollar_arizona_directives.gif',
        size: 94445.72,
        modified: '2022-09-27T12:09:24.486Z',
        isStarred: false,
    },
    {
        id: '25a78772-8642-4470-98bb-53abfc6cb3db',
        name: 'blues_steel.mpga',
        size: 90869.88,
        modified: '2022-04-23T02:12:47.870Z',
        isStarred: true,
    },
    {
        id: '80caddc7-b49e-4573-96fd-b244e2085604',
        name: 'methodologies_ha.pdf',
        size: 20899.23,
        modified: '2022-09-25T17:44:32.948Z',
        isStarred: true,
    },
    {
        id: '7b3c9d3f-cae2-470d-bd64-d6226e74800f',
        name: 'country_washington.png',
        size: 60819.38,
        modified: '2022-12-13T04:13:07.267Z',
        isStarred: true,
    },
    {
        id: '235fdaf9-2f2e-449a-ab4e-816c8e30683b',
        name: 'male_exe.jpe',
        size: 92271.92,
        modified: '2022-11-11T03:59:09.871Z',
        isStarred: false,
    },
    {
        id: '1e39265e-e631-4139-af09-035938f69a6c',
        name: 'ew_input.pdf',
        size: 45538.96,
        modified: '2022-04-18T12:45:42.981Z',
        isStarred: true,
    },
    {
        id: 'b2ff973c-1866-4e33-8846-09af769d5fd5',
        name: 'folk_throughout.wav',
        size: 83893.82,
        modified: '2022-07-19T19:17:37.440Z',
        isStarred: true,
    },
    {
        id: '2918971e-be4e-4645-9506-64f742c35895',
        name: 'dogwood.gif',
        size: 14410.75,
        modified: '2022-06-30T04:48:00.621Z',
        isStarred: false,
    },
    {
        id: 'fa67a7f3-a800-4732-af88-91bf0250edd6',
        name: 'hybrid.pdf',
        size: 21159.86,
        modified: '2022-11-12T11:23:05.481Z',
        isStarred: true,
    },
];

const Drive = ({ params: { slug } }: { params: { slug?: string } }) => {
    const { data, error, isLoading } = useDriveList(slug);

    const onDrop = useCallback(
        (acceptedFiles: FileWithPath[]) =>
            acceptedFiles.forEach(f => {
                sanitize(f.name);
            }),
        []
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: true,
        noClick: true,
        noKeyboard: true,
    });

    const inputProps = useMemo(() => getInputProps(), [getInputProps]);

    const [isEditorOpen, setIsEditorOpen] = useState(false);

    return (
        <div className='h-full' {...getRootProps()}>
            {isEditorOpen && (
                <NotesDialog
                    isEditorOpen={isEditorOpen}
                    closeEditor={() => {
                        setIsEditorOpen(false);
                    }}
                />
            )}

            <FullscreenUpload
                isDragActive={isDragActive}
                inputProps={inputProps}
            />

            {false && <UploadProgressBox />}

            <div className='mb-4 min-h-full rounded-lg bg-white p-4 shadow-md lg:mt-4 lg:mb-8'>
                {isLoading && (
                    <div className='grid h-full w-full place-items-center'>
                        <Loader size={20} className='animate-spin' />
                    </div>
                )}

                {!!error && (
                    <div className='min-h-full w-full text-red-600'>Error!</div>
                )}

                {data !== undefined && (
                    <>
                        <Toolbar slug={slug} />

                        <div className='hidden min-h-full overflow-x-auto lg:block'>
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
                                            className='sr-only w-8 text-left 2xl:w-6'>
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
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
                                                        className='shrink-0 fill-brand text-brand'
                                                        size={16}
                                                    />
                                                    <span className='truncate text-sm'>
                                                        {folder.metadata.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td
                                                className='py-3 text-sm text-gray-500'
                                                title='Toggle Starred'>
                                                <button type='button'>
                                                    <Star
                                                        size={20}
                                                        className={clsx(
                                                            true
                                                                ? 'fill-yellow-500 text-yellow-500'
                                                                : 'fill-none',
                                                            'mx-3 cursor-pointer'
                                                        )}
                                                    />
                                                </button>
                                            </td>
                                            <td className='py-3 text-left text-sm'>
                                                {new Date(
                                                    folder.metadata.modified
                                                ).toLocaleString()}
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
                                                        <Menu.Items className='flex w-48 flex-col items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg focus:outline-none'>
                                                            <Menu.Item
                                                                as='button'
                                                                onClick={() =>
                                                                    setIsEditorOpen(
                                                                        true
                                                                    )
                                                                }
                                                                className='w-full px-2 py-2 text-sm font-medium ui-active:bg-brand ui-active:text-white ui-not-active:bg-white ui-not-active:text-gray-900'>
                                                                Notes
                                                            </Menu.Item>
                                                            <Menu.Item
                                                                as='button'
                                                                className='w-full px-2 py-2 text-sm font-medium ui-active:bg-brand ui-active:text-white ui-not-active:bg-white ui-not-active:text-gray-900'>
                                                                Details
                                                            </Menu.Item>
                                                            <Menu.Item
                                                                as='button'
                                                                className='w-full px-2 py-2 text-sm font-medium ui-active:bg-brand ui-active:text-white ui-not-active:bg-white ui-not-active:text-gray-900'>
                                                                Rename
                                                            </Menu.Item>
                                                            <Menu.Item
                                                                as='button'
                                                                className='w-full px-2 py-2 text-sm font-medium ui-active:bg-brand ui-active:text-white ui-not-active:bg-white ui-not-active:text-gray-900'>
                                                                Copy
                                                            </Menu.Item>
                                                            <Menu.Item
                                                                as='button'
                                                                className='w-full px-2 py-2 text-sm font-medium ui-active:bg-brand ui-active:text-white ui-not-active:bg-white ui-not-active:text-gray-900'>
                                                                Move
                                                            </Menu.Item>
                                                            <Menu.Item
                                                                as='button'
                                                                className='w-full px-2 py-2 text-sm font-medium ui-active:bg-brand ui-active:text-white ui-not-active:bg-white ui-not-active:text-gray-900'>
                                                                Delete
                                                            </Menu.Item>
                                                        </Menu.Items>
                                                    </Float>
                                                </Menu>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                <div className='grid grid-cols-1 gap-2 lg:hidden'>
                    {fakeData.map(file => (
                        <div
                            key={file.id}
                            title={file.name}
                            className='flex cursor-pointer items-center justify-between gap-2 whitespace-nowrap rounded-lg border p-4 py-3 text-gray-900'>
                            <div className='flex items-center gap-2'>
                                <Folder
                                    size={24}
                                    className='fill-brand text-brand'
                                />

                                <span className='w-44 truncate text-sm font-medium sm:w-96'>
                                    {file.name}
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
                                        <Menu.Items className='flex w-48 flex-col items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg focus:outline-none'>
                                            <Menu.Item
                                                as='button'
                                                onClick={() =>
                                                    setIsEditorOpen(true)
                                                }
                                                className='w-full px-2 py-2 text-sm font-medium ui-active:bg-brand ui-active:text-white ui-not-active:bg-white ui-not-active:text-gray-900'>
                                                View Note
                                            </Menu.Item>
                                            <Menu.Item
                                                as='button'
                                                className='w-full px-2 py-2 text-sm font-medium ui-active:bg-brand ui-active:text-white ui-not-active:bg-white ui-not-active:text-gray-900'>
                                                View Details
                                            </Menu.Item>
                                            <Menu.Item
                                                as='button'
                                                className='w-full px-2 py-2 text-sm font-medium ui-active:bg-brand ui-active:text-white ui-not-active:bg-white ui-not-active:text-gray-900'>
                                                Rename
                                            </Menu.Item>
                                            <Menu.Item
                                                as='button'
                                                className='w-full px-2 py-2 text-sm font-medium ui-active:bg-brand ui-active:text-white ui-not-active:bg-white ui-not-active:text-gray-900'>
                                                Copy
                                            </Menu.Item>
                                            <Menu.Item
                                                as='button'
                                                className='w-full px-2 py-2 text-sm font-medium ui-active:bg-brand ui-active:text-white ui-not-active:bg-white ui-not-active:text-gray-900'>
                                                Move
                                            </Menu.Item>
                                            <Menu.Item
                                                as='button'
                                                className='w-full px-2 py-2 text-sm font-medium ui-active:bg-brand ui-active:text-white ui-not-active:bg-white ui-not-active:text-gray-900'>
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
