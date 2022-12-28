import { Logo } from '@/components/logo';
import { Providers } from '@/components/providers';
import { FC, PropsWithChildren } from 'react';

const RootLayout: FC<PropsWithChildren> = ({ children }) => (
    <div className='container mx-auto h-full px-4'>
        <div className='grid h-full place-items-center'>
            <div className='flex flex-col items-center justify-center rounded-md border bg-white p-8 shadow sm:min-w-[366px]'>
                <Logo width={56} />
                <Providers>{children}</Providers>
            </div>
        </div>
    </div>
);

export default RootLayout;
