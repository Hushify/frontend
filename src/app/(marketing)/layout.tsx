import { ReactNode } from 'react';

import { Navbar } from '@/lib/components/navbar';

function RootLayout({ children }: { children: ReactNode }) {
    return (
        <div className='flex h-full flex-col'>
            <Navbar />
            <div className='container relative mx-auto mt-16 flex-auto px-4'>
                {children}
            </div>
        </div>
    );
}

export default RootLayout;
