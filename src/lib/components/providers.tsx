'use client';

import { AlertList } from '@/lib/components/alert-list';
import { useCheckAuth } from '@/lib/hooks/use-check-auth';
import { useAuthStore } from '@/lib/stores/auth-store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Loader } from 'lucide-react';
import { ReactNode } from 'react';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            suspense: true,
        },
    },
});

export function Providers({ children }: { children: ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            {/* <ReactQueryDevtools initialIsOpen={false} /> */}
            <AlertList />
            {children}
        </QueryClientProvider>
    );
}

export function AuthStateProvider({ children }: { children: ReactNode }) {
    const status = useCheckAuth();
    const accessToken = useAuthStore(state => state.accessToken);

    if (status === 'unauthenticated') {
        return null;
    }

    if (accessToken && status === 'authenticated') {
        return children;
    }

    return (
        <div className='grid h-full w-full place-items-center'>
            <Loader size={32} className='my-4 animate-spin stroke-brand-600' />
        </div>
    );
}
