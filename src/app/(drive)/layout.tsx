import { AppShell } from '@/lib/components/app-shell';
import { AuthStateProvider } from '@/lib/components/providers';
import { ReactNode } from 'react';

export const metadata = {
    title: 'Hushify Drive',
};

function RootLayout({ children }: { children: ReactNode }) {
    return (
        <AuthStateProvider>
            <AppShell>{children}</AppShell>
        </AuthStateProvider>
    );
}

export default RootLayout;
