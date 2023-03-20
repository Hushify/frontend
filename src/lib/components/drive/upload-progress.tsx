import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown, File, RefreshCw, X } from 'lucide-react';

import { useAuthStore } from '@/lib/stores/auth-store';
import { useUploadStore } from '@/lib/stores/upload-store';
import { cn } from '@/lib/utils/cn';

export function UploadProgressBox() {
    const accessToken = useAuthStore(state => state.accessToken)!;
    const files = useUploadStore(state => state.files);
    const removeFile = useUploadStore(state => state.removeFile);
    const retry = useUploadStore(state => state.retry);
    const clear = useUploadStore(state => state.clear);

    if (files.length <= 0) return null;

    return (
        <div className='fixed bottom-4 right-4 z-20 space-y-4 rounded bg-white shadow-2xl ring ring-gray-600/25'>
            <Accordion.Root
                className='w-80 rounded-md bg-gray-50 shadow shadow-black/5'
                defaultValue='single'
                type='single'
                collapsible>
                <Accordion.Item
                    value='single'
                    className={cn(
                        'mt-px overflow-hidden first:mt-0 first:rounded-t last:rounded-b focus-within:relative focus-within:z-10 focus-within:shadow focus-within:shadow-gray-200'
                    )}>
                    <Accordion.Header className='flex'>
                        <Accordion.Trigger
                            className={cn(
                                'group flex flex-1 cursor-default items-center justify-between bg-white px-4 py-1.5 leading-none text-brand-600 shadow shadow-gray-200 outline-none hover:bg-gray-200'
                            )}>
                            Status
                            <ChevronDown
                                className='text-brand-600 transition-transform duration-300 ease-out group-data-[state=open]:rotate-180'
                                aria-hidden
                            />
                        </Accordion.Trigger>
                        <button
                            type='button'
                            onClick={clear}
                            className='flex items-center justify-center p-2'>
                            Clear
                        </button>
                    </Accordion.Header>
                    <Accordion.Content
                        className={cn(
                            'max-h-40 overflow-hidden overflow-y-auto bg-gray-100 text-[15px] text-gray-600 data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp'
                        )}>
                        <ul className='flex flex-col gap-4 p-4'>
                            {files.map(fileWithState => (
                                <li
                                    className='space-y-2'
                                    key={fileWithState.trackingId}>
                                    <div className='flex items-center justify-between gap-4'>
                                        <div className='flex w-[180px] items-center gap-1 sm:w-[292px]'>
                                            <File className='h-4 w-4 shrink-0' />
                                            <div
                                                className='w-[160px] truncate text-sm'
                                                title={
                                                    fileWithState
                                                        .fileWithVersion.file
                                                        .name
                                                }>
                                                {
                                                    fileWithState
                                                        .fileWithVersion.file
                                                        .name
                                                }
                                            </div>
                                        </div>
                                        <div className='flex items-center justify-center gap-2 pr-3'>
                                            <div className='text-sm'>
                                                {fileWithState.state}
                                            </div>
                                            <button
                                                onClick={() => {
                                                    if (
                                                        fileWithState.state !==
                                                        'Failed'
                                                    ) {
                                                        removeFile(
                                                            fileWithState.trackingId
                                                        );
                                                    }

                                                    if (
                                                        fileWithState.state ===
                                                        'Failed'
                                                    ) {
                                                        retry(
                                                            fileWithState.trackingId,
                                                            accessToken
                                                        );
                                                    }
                                                }}
                                                type='button'
                                                className='flex items-center justify-center gap-2'>
                                                {fileWithState.state ===
                                                'Failed' ? (
                                                    <RefreshCw className='h-4 w-4' />
                                                ) : (
                                                    <X className='h-4 w-4' />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <div
                                            role='presentation'
                                            style={{
                                                width: `${fileWithState.progress}%`,
                                            }}
                                            className={cn(
                                                'h-1 rounded-full bg-green-600',
                                                {
                                                    'bg-yellow-600':
                                                        fileWithState.state ===
                                                            'Uploading' ||
                                                        fileWithState.state ===
                                                            'Pending',
                                                    'bg-red-600':
                                                        fileWithState.state ===
                                                        'Failed',
                                                    'bg-green-600':
                                                        fileWithState.state ===
                                                        'Uploaded',
                                                }
                                            )}
                                        />
                                        <progress
                                            className='sr-only'
                                            value={fileWithState.progress}
                                            max={100}
                                        />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </Accordion.Content>
                </Accordion.Item>
            </Accordion.Root>
        </div>
    );
}
