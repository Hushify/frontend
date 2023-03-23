'use client';

import Script from 'next/script';

import { PlausibleArgs } from '@/lib/types/plausible';

const excludedPages = ['/drive**', '/shared**', '/trash**'];

export function Analytics() {
    if (!process.env.NEXT_PUBLIC_ANALYTICS_ENABLED) {
        return null;
    }
    return (
        <Script
            strategy='afterInteractive'
            data-domain='hushify.io'
            src='https://plausible.hushify.io/js/script.exclusions.tagged-events.js'
            data-exclude={excludedPages.join(', ')}
            onLoad={() => {
                window.plausible =
                    window.plausible ||
                    function () {
                        (window.plausible.q = window.plausible.q || []).push(
                            arguments as unknown as PlausibleArgs
                        );
                    };
            }}
        />
    );
}
