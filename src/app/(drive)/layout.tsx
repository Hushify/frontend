import { AppShell } from '@/components/app-shell';
import { AuthStateProvider, Providers } from '@/components/providers';
import { FC, PropsWithChildren } from 'react';

const RootLayout: FC<PropsWithChildren> = ({ children }) => (
    <Providers>
        <AuthStateProvider>
            <AppShell pageTitle='Drive'>{children}</AppShell>
        </AuthStateProvider>
    </Providers>
);

export default RootLayout;
