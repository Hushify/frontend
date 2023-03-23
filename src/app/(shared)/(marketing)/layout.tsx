import { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <div className='flex flex-auto overflow-y-auto'>
            <div className='container relative mx-auto mt-16 flex-auto px-4'>{children}</div>
        </div>
    );
}
