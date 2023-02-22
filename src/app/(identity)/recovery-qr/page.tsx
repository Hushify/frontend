'use client';

import Loader from '@/app/loading';
import { clientRoutes } from '@/lib/data/routes';
import { useAuthStore } from '@/lib/stores/auth-store';
import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import qrcode from 'qrcode';
import { useEffect, useState } from 'react';

export default function RecoveryQr() {
    const recoveryKeyMnemonic = useAuthStore(
        state => state.recoveryKeyMnemonic
    );

    const [recoveryQr, setRecoveryQr] = useState<string | null>(null);

    useEffect(() => {
        if (!recoveryKeyMnemonic) {
            return;
        }

        qrcode
            .toDataURL(recoveryKeyMnemonic, {
                color: {
                    dark: '#4f46e5',
                    light: '#ffffff',
                },
                width: 256,
            })
            .then(setRecoveryQr);
    }, [recoveryKeyMnemonic]);

    if (!recoveryKeyMnemonic) {
        return redirect(clientRoutes.index);
    }

    return (
        <div className='flex min-h-full max-w-md flex-col items-center justify-center gap-6 p-4 text-center'>
            <h3 className='text-center text-xl font-bold leading-6 text-gray-900 print:text-xl'>
                Recovery Key
            </h3>

            <div className='space-y-2 text-gray-600'>
                <p>
                    This is your recovery key, please print and save it
                    somewhere safe.
                </p>
                <p>
                    Note: We do not have access to your password and your master
                    key, so this key is the only way to recover your account if
                    you lose your password.
                </p>
            </div>

            {recoveryQr ? (
                <div className='flex items-center justify-center'>
                    <Image
                        src={recoveryQr}
                        alt='Recovery QR Code.'
                        className='h-64 w-64 rounded-lg border-2 border-gray-300'
                        height={256}
                        width={256}
                    />
                </div>
            ) : (
                <div className='relative h-64 w-64'>
                    <Loader />
                </div>
            )}

            <div className='rounded-lg border-2 border-gray-300 bg-white p-4'>
                <code>{recoveryKeyMnemonic}</code>
            </div>

            <div className='w-full space-y-4'>
                <button
                    type='button'
                    onClick={() => window.print()}
                    className={clsx(
                        'flex w-full items-center justify-center gap-2 rounded-lg py-1.5 font-medium',
                        'bg-brand-600 text-white focus-visible:ring-brand-600/75 print:hidden'
                    )}>
                    Print
                </button>

                <Link
                    type='button'
                    href={clientRoutes.drive}
                    className={clsx(
                        'flex w-full items-center justify-center gap-2 rounded-lg py-1.5 font-medium',
                        'bg-gray-600 text-white focus-visible:ring-gray-600/75 print:hidden'
                    )}>
                    Continue to Drive
                </Link>
            </div>
        </div>
    );
}
