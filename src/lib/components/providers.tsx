'use client';

import { AlertList } from '@/lib/components/alert';
import { useCheckAuth } from '@/lib/hooks/use-check-auth';
import { useAuthStore } from '@/lib/stores/auth-store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { FC, PropsWithChildren } from 'react';
import { Loader } from 'react-feather';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            suspense: true,
        },
    },
});

export const Providers: FC<PropsWithChildren> = ({ children }) => (
    <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
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
            <Loader size={32} className='my-4 animate-spin stroke-brand-600' />
        </div>
    );
};
