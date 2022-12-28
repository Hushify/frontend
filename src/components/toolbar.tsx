'use client';

import { NewFolderDialog } from '@/components/new-folder-dialog';
import { Menu, Transition } from '@headlessui/react';
import { PencilIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { Copy, FilePlus, FolderPlus, Move, Plus, Trash } from 'react-feather';

export const Toolbar = ({ slug }: { slug: string | undefined }) => {
    const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);

    return (
        <nav className='flex flex-wrap items-center justify-center gap-2 py-2 pl-2 pr-1 lg:justify-start'>
            <div className='relative z-10'>
                <NewFolderDialog
                    slug={slug}
                    isNewFolderOpen={isNewFolderOpen}
                    setIsNewFolderOpen={setIsNewFolderOpen}
                />
            </div>

            <Menu as='div' className='relative z-10 inline-block text-left'>
                {({ open }) => (
                    <>
                        <Menu.Button className='inline-flex w-full items-center justify-center gap-1 rounded-md bg-brand px-2.5 py-1.5 text-sm font-medium text-white md:px-4 md:py-2'>
                            <span>Create</span>
                            <Plus
                                size={20}
                                className='hidden transition ui-open:rotate-180 md:block'
                            />
                        </Menu.Button>
                        <Transition
                            show={open}
                            enter='transition duration-100 ease-out'
                            enterFrom='transform scale-95 opacity-0'
                            enterTo='transform scale-100 opacity-100'
                            leave='transition duration-75 ease-out'
                            leaveFrom='transform scale-100 opacity-100'
                            leaveTo='transform scale-95 opacity-0'>
                            <Menu.Items className='absolute left-0 z-50 mt-2 w-56 origin-top-left divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'>
                                <div className='px-1 py-1'>
                                    <Menu.Item
                                        as='button'
                                        onClick={() => setIsNewFolderOpen(true)}
                                        className='group flex w-full items-center gap-1 rounded-md px-2 py-2 text-sm font-medium ui-active:bg-brand ui-active:text-white ui-not-active:bg-white ui-not-active:text-gray-900'>
                                        <FolderPlus className='hidden w-4 md:block' />
                                        <span>New folder</span>
                                    </Menu.Item>
                                    <Menu.Item
                                        as='button'
                                        onClick={console.log}
                                        className='group flex w-full items-center gap-1 rounded-md px-2 py-2 text-sm font-medium ui-active:bg-brand ui-active:text-white ui-not-active:bg-white ui-not-active:text-gray-900'>
                                        <FilePlus className='hidden w-4 md:block' />
                                        <span>Upload File</span>
                                    </Menu.Item>
                                </div>
                            </Menu.Items>
                        </Transition>
                    </>
                )}
            </Menu>

            <button
                type='button'
                className='inline-flex items-center justify-center gap-1 rounded-md bg-gray-600 px-2.5 py-1.5 text-sm font-medium text-white md:px-4 md:py-2'>
                <span>Rename</span>
                <PencilIcon className='hidden w-5 md:block' />
            </button>

            <button
                type='button'
                className='inline-flex items-center justify-center gap-1 rounded-md bg-gray-600 px-2.5 py-1.5 text-sm font-medium text-white md:px-4 md:py-2'>
                <span>Copy</span>
                <Copy size={20} className='hidden md:block' />
            </button>

            <button
                type='button'
                className='inline-flex items-center justify-center gap-1 rounded-md bg-gray-600 px-2.5 py-1.5 text-sm font-medium text-white md:px-4 md:py-2'>
                <span>Move</span>
                <Move size={20} className='hidden md:block' />
            </button>

            <button
                type='button'
                className='inline-flex items-center justify-center gap-1 rounded-md bg-red-600 px-2.5 py-1.5 text-sm font-medium text-white md:px-4 md:py-2'>
                <span>Delete</span>
                <Trash size={20} className='hidden md:block' />
            </button>
        </nav>
    );
};
