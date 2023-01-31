import { Logo } from '@/lib/components/logo';
import { FC, PropsWithChildren } from 'react';

const RootLayout: FC<PropsWithChildren> = ({ children }) => (
    <div className='container mx-auto grid h-full place-items-center px-4'>
        <div className='flex flex-col items-center justify-center gap-1 rounded-md p-8 sm:min-w-[366px]'>
            <Logo width={56} />
            {children}
        </div>
    </div>
);

export default RootLayout;
