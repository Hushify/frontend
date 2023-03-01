'use client';

import { ReactNode, useEffect, useState } from 'react';
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
    const [loaded, setLoaded] = useState(false);
    const status = useCheckAuth();
    const hasRequiredKeys = useAuthStore(state => state.hasRequiredKeys);

    useEffect(() => setLoaded(true), []);

    if (!loaded) {
        return null;
    }

    if (status === 'unauthenticated') {
        return null;
    }

    if (hasRequiredKeys() && status === 'authenticated') {
        return <>{children}</>;
    }

    return (
        <div className='grid h-full w-full place-items-center'>
            <Loader size={32} className='my-4 animate-spin stroke-brand-600' />
        </div>
    );
}
