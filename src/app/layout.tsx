import '@/styles/tw.css';
import { Inter } from '@next/font/google';
import clsx from 'clsx';
import { FC, PropsWithChildren } from 'react';

const inter = Inter({
    variable: '--font-inter',
    weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

const RootLayout: FC<PropsWithChildren> = ({ children }) => (
    <html lang='en' dir='ltr' className={clsx(inter.variable, 'font-sans')}>
        <head />
        <body className={`${process.env.NODE_ENV === 'development' ? '' : ''}`}>
            {children}
        </body>
    </html>
);

export default RootLayout;
