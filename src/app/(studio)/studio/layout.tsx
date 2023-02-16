import { ReactNode } from 'react';

function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang='en' dir='ltr'>
            <head />
            <body>{children}</body>
        </html>
    );
}

export default RootLayout;
