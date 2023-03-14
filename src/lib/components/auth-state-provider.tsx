'use client';

import { ReactNode, useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import { Loader } from 'lucide-react';

import { clientRoutes } from '@/lib/data/routes';
import { useAuth } from '@/lib/hooks/use-auth';

export function AuthStateProvider({ children }: { children: ReactNode }) {
    const [loaded, setLoaded] = useState(false);
    const status = useAuth();

    useEffect(() => setLoaded(true), []);

    if (!loaded) {
        return null;
    }

    if (status === 'unauthenticated') {
        return redirect(clientRoutes.identity.login);
    }

    if (status === 'authenticated') {
        return <>{children}</>;
    }

    return (
        <div className='grid h-full w-full place-items-center'>
            <Loader size={32} className='my-4 animate-spin stroke-brand-600' />
        </div>
    );
}
