'use client';

import { ServerCrash } from 'lucide-react';

export default function GlobalError({ error: _, reset }: { error: Error; reset: () => void }) {
    return (
        <html>
            <head></head>
            <body>
                <div className='flex h-full w-full flex-col items-center justify-center gap-4 text-center'>
                    <h2 className='text-2xl font-medium'>Something went wrong!</h2>
                    <button
                        onClick={reset}
                        className='flex cursor-pointer items-center justify-center gap-1 rounded-lg bg-brand-600 px-2.5 py-1.5 font-medium text-white focus-visible:ring-brand-600/75'>
                        <span>Try again</span>
                        <ServerCrash className='h-4 w-4' />
                    </button>
                </div>
            </body>
        </html>
    );
}
