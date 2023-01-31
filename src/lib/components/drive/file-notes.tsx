'use client';

// import { NotesEditor } from '@/components/drive/notes-editor';
import { EditorJsWrapper } from '@/lib/components/editor-js';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

export const NotesDialog = ({
    isEditorOpen,
    closeEditor,
}: {
    isEditorOpen: boolean;
    closeEditor: () => void;
}) => (
    <Transition appear show={isEditorOpen} as={Fragment}>
        <Dialog as='div' onClose={closeEditor} className='relative z-50'>
            <Transition.Child
                as={Fragment}
                enter='ease-out duration-300'
                enterFrom='opacity-0'
                enterTo='opacity-100'
                leave='ease-in duration-200'
                leaveFrom='opacity-100'
                leaveTo='opacity-0'>
                <div className='fixed inset-0 z-40 bg-black bg-opacity-25' />
            </Transition.Child>
            <div className='fixed inset-0 z-50 overflow-y-auto'>
                <div className='flex min-h-full items-center justify-center p-4 text-center'>
                    <Transition.Child
                        as={Fragment}
                        enter='ease-out duration-300'
                        enterFrom='opacity-0 scale-95'
                        enterTo='opacity-100 scale-100'
                        leave='ease-in duration-200'
                        leaveFrom='opacity-100 scale-100'
                        leaveTo='opacity-0 scale-95'>
                        <Dialog.Panel className='w-full max-w-xl transform space-y-4 overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all'>
                            <Dialog.Title
                                as='h3'
                                className='text-center text-lg font-bold leading-6 text-gray-900 print:text-xl'>
                                Note
                            </Dialog.Title>

                            <EditorJsWrapper />
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </div>
        </Dialog>
    </Transition>
);
