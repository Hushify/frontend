import { RecoveryKey } from '@/app/(identity)/recovery-key/recovery-key';

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
    return <RecoveryKey />;
}
