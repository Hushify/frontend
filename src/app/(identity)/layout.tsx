import { Logo } from '@/lib/components/logo';
import { ReactNode } from 'react';

export const metadata = {
    title: 'Identity',
};

function RootLayout({ children }: { children: ReactNode }) {
    return (
        <div className='container mx-auto grid h-full place-items-center px-4'>
            <div className='flex flex-col items-center justify-center gap-2 rounded-md p-8 sm:min-w-[366px]'>
                <Logo width={36} />
                {children}
            </div>
        </div>
    );
}

export default RootLayout;
