'use client';

import { apiRoutes, clientRoutes } from '@/lib/data/routes';
import { isTokenExpired, refreshToken } from '@/lib/services/auth';
import { CryptoService } from '@/lib/services/crypto.worker';
import { useAuthStore } from '@/lib/stores/auth-store';
import { wrap } from 'comlink';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import { shallow } from 'zustand/shallow';

export const useCheckAuth = () => {
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

                if (result.success) {
                    const worker = new Worker(
                        new URL(
                            '@/lib/services/crypto.worker',
                            import.meta.url
                        ),
                        {
                            type: 'module',
                            name: 'hushify-crypto-worker',
                        }
                    );

                    const crypto = wrap<typeof CryptoService>(worker);

                    const decryptedAccessToken =
                        await crypto.decryptAccessToken(
                            result.data.encAccessToken,
                            result.data.accessTokenNonce,
                            result.data.serverPublicKey,
                            asymmetricEncPrivateKey
                        );

                    setAccessToken(decryptedAccessToken);
                    setStatus('authenticated');
                } else {
                    await logout();
                    push(clientRoutes.identity.login);
                }
            } catch (e) {
                await logout();
                push(clientRoutes.identity.login);
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
};
