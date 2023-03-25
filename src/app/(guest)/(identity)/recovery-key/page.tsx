import { RecoveryKey } from '@/app/(guest)/(identity)/recovery-key/recovery-key';

export const metadata = {
    title: 'Recovery Key',
    openGraph: {
        title: 'Recovery Key',
    },
    twitter: {
        title: 'Recovery Key',
    },
};

export default function RecoveryKeyPage() {
    return (
        <div className='flex min-h-full max-w-md flex-col items-center justify-center gap-6 p-4 text-center'>
            <h3 className='text-center text-xl font-bold leading-6 text-gray-900'>Recovery Key</h3>

            <div className='space-y-2 text-gray-600'>
                <p>This is your recovery key, please download and save it somewhere safe.</p>
                <p>
                    Note: We do not have access to your password and your master key, so this key is
                    the only way to recover your account if you lose your password.
                </p>
            </div>

            <RecoveryKey />
        </div>
    );
}
