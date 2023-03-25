import { ReactNode } from 'react';

import { AppProvider } from '@/lib/components/app-provider';

export const metadata = {
    title: 'Identity',
};

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <AppProvider>
            <div className='container mx-auto grid h-full place-items-center px-4'>
                <div className='flex w-full max-w-xs flex-col items-center justify-center gap-2 rounded-md p-4 sm:min-w-[366px] sm:max-w-none sm:p-8'>
                    {children}
                </div>
            </div>
        </AppProvider>
    );
}
