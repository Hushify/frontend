import { ReactNode } from 'react';

export const metadata = {
    title: 'Hushify Drive',
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return <>{children}</>;
}
