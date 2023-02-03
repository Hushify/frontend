import { Navbar } from '@/lib/components/navbar';
import { FC, PropsWithChildren } from 'react';

const RootLayout: FC<PropsWithChildren> = ({ children }) => (
    <div className='flex h-full flex-col'>
        <Navbar />
        <div className='container mx-auto flex-auto px-4'>{children}</div>
    </div>
);

export default RootLayout;
