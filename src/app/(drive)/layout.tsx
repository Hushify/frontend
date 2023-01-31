import { AppShell } from '@/lib/components/app-shell';
import { AuthStateProvider } from '@/lib/components/providers';
import { FC, PropsWithChildren } from 'react';

const RootLayout: FC<PropsWithChildren> = ({ children }) => (
    <AuthStateProvider>
        <AppShell>{children}</AppShell>
    </AuthStateProvider>
);

export default RootLayout;
