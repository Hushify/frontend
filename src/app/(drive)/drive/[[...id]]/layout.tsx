import { ReactNode } from 'react';

export const metadata = {
    title: 'Hushify Drive',
};

export default function Layout({ children }: { children: ReactNode }) {
    return <>{children}</>;
}
