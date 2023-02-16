import { Navbar } from '@/lib/components/navbar';
import { ReactNode } from 'react';

export const metadata = {
    title: {
        default: 'Hushify',
        template: '%s',
    },
    keywords: 'Hushify',
    description: 'Hushify, an opensource end to end encrypted storage.',
    robots: {
        index: true,
        follow: true,
    },
    themeColor: '#4f46e5',
    openGraph: {
        description: 'Hushify, an opensource end to end encrypted storage.',
        type: 'website',
        title: {
            default: 'Hushify',
            template: '%s',
        },
        images: `https://${
            process.env.NEXT_PUBLIC_DOMAIN ?? 'hushify.io'
        }/android-icon-192x192.png`,
    },
    twitter: {
        description: 'Hushify, an opensource end to end encrypted storage.',
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
        <div className='flex h-full flex-col'>
            <Navbar />
            <div className='container relative mx-auto mt-16 flex-auto px-4'>
                {children}
            </div>
        </div>
    );
}

export default RootLayout;
