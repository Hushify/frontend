import '@/styles/tw.css';
import { ReactNode } from 'react';

import { Analytics } from '@/lib/components/analytics';
import { cn } from '@/lib/utils/cn';

export const metadata = {
    title: {
        default: 'Hushify',
        template: '%s',
    },
    keywords: 'Hushify',
    description: 'Privacy, built on open source.',
    robots: {
        index: true,
        follow: true,
    },
    themeColor: '#4f46e5',
    metadataBase: new URL(`https://${process.env.NEXT_PUBLIC_DOMAIN}`),
    manifest: '/manifest.json',
    openGraph: {
        description: 'Privacy, built on open source.',
        type: 'website',
        title: {
            default: 'Hushify',
            template: '%s',
        },
        images: '/og.png',
    },
    twitter: {
        description: 'Privacy, built on open source.',
        title: {
            default: 'Hushify',
            template: '%s',
        },
        card: 'summary',
        creator: '@HushifyIO',
        images: '/og.png',
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

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang='en' dir='ltr' data-mode='dark'>
            <head />
            <body
                className={cn({
                    'debug-screens': process.env.NODE_ENV === 'development',
                })}>
                {children}
                <Analytics />
            </body>
        </html>
    );
}
