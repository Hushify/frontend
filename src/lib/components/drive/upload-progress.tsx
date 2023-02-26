import { File, RefreshCw, X } from 'lucide-react';

export function UploadProgressBox() {
    return (
        <div className='fixed bottom-4 right-4 z-20 space-y-4 rounded-lg bg-white px-2 py-4 shadow-2xl ring ring-gray-900/75'>
            <div className='max-h-40 overflow-y-auto'>
                <ul className='space-y-3 px-2'>
                    <li className='space-y-2'>
                        <div className='flex items-center justify-between gap-4'>
                            <div className='flex w-[180px] items-center gap-2 sm:w-[292px]'>
                                <File size={16} />
                                <div className='truncate text-sm'>
                                    presentation.pptx
                                </div>
                            </div>
                            <div className='flex items-center justify-center gap-2 pr-3'>
                                <div className='text-sm'>Error</div>
                                <div className='flex items-center justify-center gap-2'>
                                    <RefreshCw
                                        size={16}
                                        className='cursor-pointer'
                                    />
                                </div>
                            </div>
                        </div>
                        <div>
                            <div
                                role='presentation'
                                className='h-1 w-1/2 rounded-full bg-red-600'
                            />
                            <progress
                                className='sr-only'
                                value={20}
                                max={100}
                            />
                        </div>
                    </li>

                    <li className='space-y-2'>
                        <div className='flex items-center justify-between gap-4'>
                            <div className='flex w-[180px] items-center gap-2 sm:w-[292px]'>
                                <File size={16} />
                                <div className='truncate text-sm'>
                                    important-case-file.docx
                                </div>
                            </div>
                            <div className='flex items-center justify-center gap-2 pr-3'>
                                <div className='text-sm'>Uploading</div>
                                <div className='flex items-center justify-center gap-2'>
                                    <X size={16} className='cursor-pointer' />
                                </div>
                            </div>
                        </div>
                        <div>
                            <div
                                role='presentation'
                                className='h-1 w-3/4 rounded-full bg-yellow-400'
                            />
                            <progress
                                className='sr-only'
                                value={20}
                                max={100}
                            />
                        </div>
                    </li>

                    <li className='space-y-2'>
                        <div className='flex items-center justify-between gap-4'>
                            <div className='flex w-[180px] items-center gap-2 sm:w-[292px]'>
                                <File size={16} />
                                <div className='truncate text-sm'>
                                    important-case-file.docx
                                </div>
                            </div>
                            <div className='flex items-center justify-center gap-2 pr-3'>
                                <div className='text-sm'>Done</div>
                                <div className='flex items-center justify-center gap-2'>
                                    <X size={16} className='cursor-pointer' />
                                </div>
                            </div>
                        </div>
                        <div>
                            <div
                                role='presentation'
                                className='h-1 w-full rounded-full bg-green-600'
                            />
                            <progress
                                className='sr-only'
                                value={20}
                                max={100}
                            />
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    );
}
