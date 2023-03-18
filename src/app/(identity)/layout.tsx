import { ReactNode } from 'react';

import { Logo } from '@/lib/components/logo';

export const metadata = {
    title: 'Identity',
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <div className='container mx-auto grid h-full place-items-center px-4'>
            <div className='flex w-full max-w-xs flex-col items-center justify-center gap-2 rounded-md p-4 sm:min-w-[366px] sm:max-w-none sm:p-8'>
                <Logo width={36} />
                {children}
            </div>
        </div>
    );
}
