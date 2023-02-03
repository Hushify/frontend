import { Navbar } from '@/lib/components/navbar';
import { FC, PropsWithChildren } from 'react';

const RootLayout: FC<PropsWithChildren> = ({ children }) => (
    <div>
        <Navbar />
        <div className='container mx-auto h-full px-4'>{children}</div>
    </div>
);

export default RootLayout;
