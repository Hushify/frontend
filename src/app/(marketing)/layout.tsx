import { ReactNode } from 'react';
import Script from 'next/script';

import { Navbar } from '@/lib/components/navbar';

const excludePages = [
    '/drive**',
    '/shared**',
    '/trash**',
    '/settings**',
    '/login**',
    '/register**',
    '/recovery-key**',
];

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <>
            {process.env.NEXT_PUBLIC_ANALYTICS_ENABLED && (
                <Script
                    strategy='afterInteractive'
                    data-domain='hushify.io'
                    src='https://plausible.hushify.io/js/script.exclusions.js'
                    data-exclude={excludePages.join(', ')}
                />
            )}
            <div className='flex h-full flex-col'>
                <Navbar />
                <div className='container relative mx-auto mt-16 flex-auto px-4'>
                    {children}
                </div>
            </div>
        </>
    );
}
