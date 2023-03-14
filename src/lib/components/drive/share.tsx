import * as Dialog from '@radix-ui/react-dialog';
import { Loader, X } from 'lucide-react';

import { cn } from '@/lib/utils/cn';

export function Share() {
    return (
        <Dialog.Root open={true}>
            <Dialog.Portal>
                <Dialog.Overlay className='fixed inset-0 bg-gray-700/50 data-[state=open]:animate-overlayShow' />
                <Dialog.Content className='fixed top-1/2 left-1/2 max-h-[85vh] w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 space-y-2 rounded-md bg-white p-6 shadow focus:outline-none data-[state=open]:animate-contentShow'>
                    <div className='flex items-center justify-between'>
                        <Dialog.Title className='m-0 text-[17px] font-medium text-gray-900'>
                            Share
                        </Dialog.Title>
                        <Dialog.Close asChild>
                            <button
                                type='button'
                                className='inline-flex h-6 w-6 items-center justify-center rounded-full text-brand-600 focus:outline-none'
                                aria-label='Close'>
                                <X />
                            </button>
                        </Dialog.Close>
                    </div>
                    <div>
                        <button
                            type='submit'
                            className={cn(
                                'flex cursor-pointer items-center justify-center gap-2 rounded py-1.5 px-2.5 text-sm font-medium',
                                'disabled:cursor-not-allowed disabled:bg-brand-600/80',
                                'bg-brand-600 text-white focus-visible:ring-brand-600/75'
                            )}>
                            <span>Stop sharing</span>
                            <Loader
                                size={16}
                                className={cn('hidden animate-spin')}
                            />
                        </button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
