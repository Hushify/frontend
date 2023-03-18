import { ReactNode } from 'react';

import { AppShell } from '@/lib/components/app-shell';
import { AuthStateProvider } from '@/lib/components/auth-state-provider';

export const metadata = {
    title: 'Hushify Drive',
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <AuthStateProvider>
            <AppShell>{children}</AppShell>
        </AuthStateProvider>
    );
}
