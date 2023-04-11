import { ReactNode } from 'react';

import { Navbar } from '@/lib/components/navbar';

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <div className='flex h-full scroll-mt-16 flex-col'>
            <Navbar />
            {children}
        </div>
    );
}
