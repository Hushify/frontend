import { ReactNode } from 'react';

import { Footer } from '@/lib/components/footer';
import { Navbar } from '@/lib/components/navbar';

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <>
            <Navbar />
            {children}
            <Footer />
        </>
    );
}
