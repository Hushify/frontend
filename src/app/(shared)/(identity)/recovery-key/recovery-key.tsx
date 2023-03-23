'use client';

import Link from 'next/link';
import { redirect } from 'next/navigation';

import { clientRoutes } from '@/lib/data/routes';
import { useAuthStore } from '@/lib/stores/auth-store';
import { cn } from '@/lib/utils/cn';
import { downloadViaAnchor } from '@/lib/utils/download-via-anchor';

export function RecoveryKey() {
    const recoveryKeyMnemonic = useAuthStore(state => state.recoveryKeyMnemonic);

    if (!recoveryKeyMnemonic) {
        return redirect(clientRoutes.index);
    }

    return (
        <>
            <div className='rounded-lg border-2 border-gray-300 bg-white p-4'>
                <code>{recoveryKeyMnemonic}</code>
            </div>

            <div className='w-full space-y-4'>
                <button
                    type='button'
                    onClick={() => {
                        downloadViaAnchor(recoveryKeyMnemonic, 'hushify-recovery-key.txt');
                    }}
                    className={cn(
                        'flex w-full items-center justify-center gap-2 rounded-lg py-1.5 font-medium',
                        'bg-brand-600 text-white focus-visible:ring-brand-600/75'
                    )}>
                    Download
                </button>

                <Link
                    type='button'
                    href={clientRoutes.drive}
                    className={cn(
                        'flex w-full items-center justify-center gap-2 rounded-lg py-1.5 font-medium',
                        'bg-gray-600 text-white focus-visible:ring-gray-600/75'
                    )}>
                    Continue to Drive
                </Link>
            </div>
        </>
    );
}
