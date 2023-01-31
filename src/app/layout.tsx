import '@/styles/tw.css';

import { Providers } from '@/lib/components/providers';
import clsx from 'clsx';
import { FC, PropsWithChildren } from 'react';

const RootLayout: FC<PropsWithChildren> = ({ children }) => (
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

export default RootLayout;
