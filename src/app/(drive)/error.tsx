'use client';

import { useEffect } from 'react';
import { ServerCrash } from 'lucide-react';

import { cn } from '@/lib/utils/cn';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className='flex h-full w-full flex-col items-center justify-center gap-4 text-center'>
            <h2 className='text-2xl font-medium'>Something went wrong!</h2>
            <button
                onClick={reset}
                className={cn(
                    'flex cursor-pointer items-center justify-center gap-1 rounded-lg px-2.5 py-1.5 font-medium',
                    'bg-brand-600 text-white focus-visible:ring-brand-600/75'
                )}>
                <span>Try again</span>
                <ServerCrash className='h-4 w-4' />
            </button>
        </div>
    );
}
