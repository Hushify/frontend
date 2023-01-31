import { FC, PropsWithChildren } from 'react';

const RootLayout: FC<PropsWithChildren> = ({ children }) => (
    <div className='container mx-auto grid h-full place-items-center px-4'>
        <div className='flex min-w-full flex-col items-center justify-center rounded-md border bg-white px-8 py-16 shadow-xl sm:min-w-[366px]'>
            {children}
        </div>
    </div>
);

export default RootLayout;
