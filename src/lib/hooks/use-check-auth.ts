'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { shallow } from 'zustand/shallow';

import { apiRoutes, clientRoutes } from '@/lib/data/routes';
import { isTokenExpired, refreshToken } from '@/lib/services/auth';
import CryptoWorker from '@/lib/services/comlink-crypto';
import { useAuthStore } from '@/lib/stores/auth-store';

export function useCheckAuth() {
    const {
        logout,
        setAccessToken,
        setStatus,
        status,
        accessToken,
        masterKey,
        asymmetricEncPrivateKey,
        asymmetricEncPublicKey,
        signingPrivateKey,
        signingPublicKey,
    } = useAuthStore(state => state, shallow);
    const { push } = useRouter();

    const isSessionValid = useCallback(
        async (forceRefresh = false) => {
            if (
                !masterKey ||
                !asymmetricEncPrivateKey ||
                !asymmetricEncPublicKey ||
                !signingPrivateKey ||
                !signingPublicKey
            ) {
                push(clientRoutes.identity.login);
                return;
            }

            if (status === 'loggingout') {
                return;
            }

            if (status === 'unauthenticated') {
                push(clientRoutes.identity.login);
                return;
            }

            if (accessToken && !isTokenExpired(accessToken) && !forceRefresh) {
                setStatus('authenticated');
                return;
            }

            try {
                const result = await refreshToken(apiRoutes.identity.refresh);

                if (!result.success) {
                    await logout();
                    push(clientRoutes.identity.login);
                    return;
                }

                const crypto = CryptoWorker.cryptoWorker;

                const decryptedAccessToken = await crypto.decryptAccessToken(
                    result.data.encAccessToken,
                    result.data.accessTokenNonce,
                    result.data.serverPublicKey,
                    asymmetricEncPrivateKey
                );

                setAccessToken(decryptedAccessToken);
                setStatus('authenticated');
            } catch (e) {
                await logout();
            }
        },
        [
            accessToken,
            asymmetricEncPrivateKey,
            asymmetricEncPublicKey,
            logout,
            masterKey,
            push,
            setAccessToken,
            setStatus,
            signingPrivateKey,
            signingPublicKey,
            status,
        ]
    );

    useEffect(() => {
        isSessionValid();

        const interval = setInterval(async () => {
            await isSessionValid(true);
        }, 1000 * 60 * 10);

        return () => clearInterval(interval);
    }, [isSessionValid]);

    return status;
}
