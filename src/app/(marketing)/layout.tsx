import { ReactNode } from 'react';

import { Navbar } from '@/lib/components/navbar';

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <>
            <div className='flex h-full flex-col'>
                <Navbar />
                <div className='container relative mx-auto mt-16 flex-auto px-4'>
                    {children}
                </div>
            </div>
        </>
    );
}
