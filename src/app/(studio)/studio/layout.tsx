import { FC, PropsWithChildren } from 'react';

const RootLayout: FC<PropsWithChildren> = ({ children }) => (
    <html lang='en' dir='ltr'>
        <head />
        <body>{children}</body>
    </html>
);

export default RootLayout;
