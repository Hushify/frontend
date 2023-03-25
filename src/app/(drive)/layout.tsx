import { ReactNode } from 'react';

import { AppProvider } from '@/lib/components/app-provider';
import { AppShell } from '@/lib/components/app-shell';
import { AuthStateProvider } from '@/lib/components/auth-state-provider';

export const metadata = {
    title: 'Drive',
};

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <AppProvider>
            <AuthStateProvider>
                <AppShell>{children}</AppShell>
            </AuthStateProvider>
        </AppProvider>
    );
}
