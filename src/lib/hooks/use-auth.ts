'use client';

import { useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { shallow } from 'zustand/shallow';

import { refreshToken } from '@/lib/services/auth';
import { CryptoWorkerInstance } from '@/lib/services/comlink-crypto';
import { useAuthStore } from '@/lib/stores/auth-store';

export function useAuth() {
    const forceRef = useRef(false);
    const authState = useAuthStore(state => state, shallow);

    const getSession = useCallback(async () => {
        if (typeof location === 'undefined') {
            return 'loading' as const;
        }

        if (authState.status === 'unauthenticated') {
            return authState.status;
        }

        if (!authState.hasRequiredKeys()) {
            await authState.logout();
            return authState.status;
        }

        if (authState.accessToken && !forceRef.current) {
            forceRef.current = true;
            authState.setData({ status: 'authenticated' });
            return authState.status;
        }

        const result = await refreshToken();

        if (!result.success && result.status === 403) {
            await authState.logout();
            return authState.status;
        }

        if (!result.success) {
            return authState.status;
        }

        const crypto = CryptoWorkerInstance;

        const decryptedAccessToken = await crypto.asymmetricDecrypt(
            result.data.encryptedAccessToken,
            result.data.accessTokenNonce,
            result.data.serverPublicKey,
            authState.privateKey!
        );

        authState.setData({ accessToken: decryptedAccessToken });
        authState.setData({ status: 'authenticated' });
        forceRef.current = true;

        return authState.status;
    }, [authState]);

    const { isLoading } = useQuery(['refreshToken'], getSession, {
        refetchOnWindowFocus: true,
        refetchInterval: 1000 * 60 * 10,
        refetchIntervalInBackground: false,
        retry: authState.status === 'authenticated',
        retryDelay: failureCount => 1000 * 60 * failureCount,
    });

    return isLoading ? ('loading' as const) : authState.status;
}
