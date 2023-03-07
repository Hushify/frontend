'use client';

import { ReactNode, useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import * as Tooltip from '@radix-ui/react-tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Loader } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

import { clientRoutes } from '@/lib/data/routes';
import { useAuth } from '@/lib/hooks/use-auth';

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
            <ReactQueryDevtools initialIsOpen={false} />
            <Tooltip.Provider>{children}</Tooltip.Provider>
            <Toaster />
        </QueryClientProvider>
    );
}

export function AuthStateProvider({ children }: { children: ReactNode }) {
    const [loaded, setLoaded] = useState(false);
    const status = useAuth();

    useEffect(() => setLoaded(true), []);

    if (!loaded) {
        return null;
    }

    if (status === 'unauthenticated') {
        return redirect(clientRoutes.identity.login);
    }

    if (status === 'authenticated') {
        return <>{children}</>;
    }

    return (
        <div className='grid h-full w-full place-items-center'>
            <Loader size={32} className='my-4 animate-spin stroke-brand-600' />
        </div>
    );
}
