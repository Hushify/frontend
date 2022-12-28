'use client';

import { AlertList } from '@/components/alert';
import { useCheckAuth } from '@/hooks/use-check-auth';
import { useAuthStore } from '@/stores/auth-store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FC, PropsWithChildren } from 'react';

const queryClient = new QueryClient();

export const Providers: FC<PropsWithChildren> = ({ children }) => (
    <QueryClientProvider client={queryClient}>
        <AlertList />
        {children}
    </QueryClientProvider>
);

export const AuthStateProvider: FC<PropsWithChildren> = ({ children }) => {
    const status = useCheckAuth();
    const accessToken = useAuthStore(state => state.accessToken);

    if (status === 'unauthenticated') {
        return null;
    }

    if (accessToken && status === 'authenticated') {
        // eslint-disable-next-line react/jsx-no-useless-fragment
        return <>{children}</>;
    }

    return (
        <div className='grid h-full w-full place-items-center'>
            <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='my-4 h-8 w-8 animate-spin stroke-brand'>
                <line x1='12' y1='2' x2='12' y2='6' />
                <line x1='12' y1='18' x2='12' y2='22' />
                <line x1='4.93' y1='4.93' x2='7.76' y2='7.76' />
                <line x1='16.24' y1='16.24' x2='19.07' y2='19.07' />
                <line x1='2' y1='12' x2='6' y2='12' />
                <line x1='18' y1='12' x2='22' y2='12' />
                <line x1='4.93' y1='19.07' x2='7.76' y2='16.24' />
                <line x1='16.24' y1='7.76' x2='19.07' y2='4.93' />
            </svg>
        </div>
    );
};
