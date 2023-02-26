'use client';

import { ReactNode } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Loader } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

import { useCheckAuth } from '@/lib/hooks/use-check-auth';
import { useAuthStore } from '@/lib/stores/auth-store';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            suspense: true,
        },
    },
});

export function Providers({ children }: { children: ReactNode }) {
    return (
        <Tooltip.Provider>
            <QueryClientProvider client={queryClient}>
                <ReactQueryDevtools initialIsOpen={false} />
                <Toaster />
                {children}
            </QueryClientProvider>
        </Tooltip.Provider>
    );
}

export function AuthStateProvider({ children }: { children: ReactNode }) {
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
}
