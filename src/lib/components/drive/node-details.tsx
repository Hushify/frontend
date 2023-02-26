import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

import { apiRoutes } from '@/lib/data/routes';
import { DriveList } from '@/lib/services/drive';

export function NodeDetails({
    id,
    close,
    show,
}: {
    id: string | undefined;
    close: () => void;
    show: boolean;
}) {
    const queryClient = useQueryClient();
    const currentFolder = queryClient.getQueryData<string | null>([
        'currentFolder',
    ]);

    const key = currentFolder
        ? `${apiRoutes.drive.list}?folderId=${currentFolder}`
        : apiRoutes.drive.list;
    const data = queryClient.getQueryData<DriveList>([key]);

    const node = data?.folders.find(f => f.id === id); // || data?.files.find(f => f.id === id);

    return (
        <Transition appear show={show} as={Fragment}>
            <Dialog as='div' onClose={close} className='relative z-50'>
                <Transition.Child
                    as={Fragment}
                    enter='ease-out duration-300'
                    enterFrom='opacity-0'
                    enterTo='opacity-100'
                    leave='ease-in duration-200'
                    leaveFrom='opacity-100'
                    leaveTo='opacity-0'>
                    <div className='fixed inset-0 bg-black/25' />
                </Transition.Child>
                <div className='fixed inset-0 overflow-y-auto'>
                    <div className='flex min-h-full items-center justify-center p-4 text-center'>
                        <Transition.Child
                            as={Fragment}
                            enter='ease-out duration-300'
                            enterFrom='opacity-0 scale-95'
                            enterTo='opacity-100 scale-100'
                            leave='ease-in duration-200'
                            leaveFrom='opacity-100 scale-100'
                            leaveTo='opacity-0 scale-95'>
                            <Dialog.Panel className='w-full max-w-md space-y-4 overflow-hidden rounded-lg bg-white p-4 px-12 text-left align-middle shadow-xl transition-all md:p-6'>
                                <Dialog.Title
                                    as='h3'
                                    className='text-md font-bold leading-6 text-gray-900 md:text-lg'>
                                    Details
                                </Dialog.Title>

                                <div>
                                    {node && (
                                        <ul className='flex flex-col justify-center gap-2 text-sm md:text-base'>
                                            <li className='flex items-start gap-1'>
                                                <span className='-mr-8 flex-1 font-bold'>
                                                    Name
                                                </span>
                                                <span className='flex-1 break-words'>
                                                    {node.metadata.name}
                                                </span>
                                            </li>
                                            <li className='flex items-start gap-1'>
                                                <span className='-mr-8 flex-1 font-bold'>
                                                    Type
                                                </span>
                                                <span className='flex-1'>
                                                    Folder
                                                </span>
                                            </li>
                                            <li className='flex items-start gap-1'>
                                                <span className='-mr-8 flex-1 font-bold'>
                                                    Created
                                                </span>
                                                <span className='flex-1'>
                                                    {format(
                                                        new Date(
                                                            node.metadata.created
                                                        ),
                                                        'MMM d, y, h:mm:ss b'
                                                    )}
                                                </span>
                                            </li>
                                            <li className='flex items-start gap-1'>
                                                <span className='-mr-8 flex-1 font-bold'>
                                                    Modified
                                                </span>
                                                <span className='flex-1'>
                                                    {format(
                                                        new Date(
                                                            node.metadata.modified
                                                        ),
                                                        'MMM d, y, h:mm:ss b'
                                                    )}
                                                </span>
                                            </li>
                                        </ul>
                                    )}
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
