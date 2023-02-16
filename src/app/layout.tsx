import '@/styles/tw.css';

import { Providers } from '@/lib/components/providers';
import clsx from 'clsx';
import { ReactNode } from 'react';

export const metadata = {
    title: {
        default: 'Hushify',
        template: '%s',
    },
    keywords: 'Hushify',
    description: 'Hushify, an opensource end to end encrypted ecosystem.',
    robots: {
        index: true,
        follow: true,
    },
    themeColor: '#4f46e5',
    openGraph: {
        description: 'Hushify, an opensource end to end encrypted ecosystem.',
        type: 'website',
        title: {
            default: 'Hushify',
            template: '%s',
        },
        images: `https://${
            process.env.NEXT_PUBLIC_DOMAIN ?? 'hushify.io'
        }/icon.png`,
    },
    twitter: {
        description: 'Hushify, an opensource end to end encrypted ecosystem.',
        title: {
            default: 'Hushify',
            template: '%s',
        },
        card: 'summary',
        creator: '@HushifyIO',
        images: `https://${
            process.env.NEXT_PUBLIC_DOMAIN ?? 'hushify.io'
        }/android-icon-192x192.png`,
    },
    icons: {
        icon: '/icon.png',
        shortcut: '/favicon-96x96.png',
        apple: '/apple-icon.png',
        other: {
            rel: 'apple-touch-icon-precomposed',
            url: '/apple-touch-icon-precomposed.png',
        },
    },
};

function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang='en' dir='ltr'>
            <head />
            <body
                className={clsx({
                    'debug-screens': process.env.NODE_ENV === 'development',
                })}>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}

export default RootLayout;
