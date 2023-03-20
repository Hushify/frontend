'use client';

import { ReactNode } from 'react';
import Script from 'next/script';
import * as Tooltip from '@radix-ui/react-tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';

import { PlausibleArgs } from '@/lib/types/plausible';

const excludedPages = ['/drive**', '/shared**', '/trash**'];

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
            {!process.env.NEXT_PUBLIC_ANALYTICS_ENABLED && (
                <Script
                    strategy='afterInteractive'
                    data-domain='hushify.io'
                    src='https://plausible.hushify.io/js/script.exclusions.tagged-events.js'
                    data-exclude={excludedPages.join(', ')}
                    onLoad={() => {
                        window.plausible =
                            window.plausible ||
                            function () {
                                (window.plausible.q =
                                    window.plausible.q || []).push(
                                    arguments as unknown as PlausibleArgs
                                );
                            };
                    }}
                />
            )}
        </QueryClientProvider>
    );
}
