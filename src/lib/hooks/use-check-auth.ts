'use client';

import { useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { shallow } from 'zustand/shallow';

import { clientRoutes } from '@/lib/data/routes';
import { refreshToken } from '@/lib/services/auth';
import CryptoWorker from '@/lib/services/comlink-crypto';
import { useAuthStore } from '@/lib/stores/auth-store';

export function useCheckAuth() {
    const forceRef = useRef(false);
    const authState = useAuthStore(state => state, shallow);
    const { push } = useRouter();

    const getSession = useCallback(async () => {
        if (typeof location === 'undefined') {
            return null;
        }

        if (!authState.hasRequiredKeys()) {
            await authState.logout();
            push(clientRoutes.identity.login);
            return null;
        }

        if (authState.status === 'loggingout') {
            return null;
        }

        if (authState.status === 'unauthenticated') {
            push(clientRoutes.identity.login);
            return null;
        }

        if (authState.accessToken && !forceRef.current) {
            forceRef.current = true;
            authState.setData({ status: 'authenticated' });
            return authState.accessToken;
        }

        try {
            const result = await refreshToken();

            if (!result.success) {
                await authState.logout();
                return null;
            }

            const crypto = CryptoWorker.cryptoWorker;

            const decryptedAccessToken = await crypto.decryptAccessToken(
                result.data.encAccessToken,
                result.data.accessTokenNonce,
                result.data.serverPublicKey,
                authState.privateKey!
            );

            authState.setData({ accessToken: decryptedAccessToken });
            authState.setData({ status: 'authenticated' });
            forceRef.current = true;

            return decryptedAccessToken;
        } catch (e) {
            await authState.logout();
        }
    }, [authState, push]);

    useQuery(['refreshToken'], getSession, {
        retry: false,
        refetchOnWindowFocus: false,
        refetchInterval: 1000 * 60 * 10,
        refetchIntervalInBackground: true,
    });

    return authState.status;
}
