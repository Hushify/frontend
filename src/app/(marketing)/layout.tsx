import { Providers } from '@/components/providers';
import { FC, PropsWithChildren } from 'react';

const RootLayout: FC<PropsWithChildren> = ({ children }) => (
    <div className='container mx-auto h-full px-4'>
        <div className='grid h-full place-items-center'>
            <div className='flex min-w-full flex-col items-center justify-center rounded-md border bg-white px-8 py-16 shadow sm:min-w-[366px]'>
                <Providers>{children}</Providers>
            </div>
        </div>
    </div>
);

export default RootLayout;
