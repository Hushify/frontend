import axios, { AxiosRequestConfig } from 'axios';

import { refreshToken } from '@/lib/services/auth';
import CryptoWorker from '@/lib/services/comlink-crypto';
import { useAuthStore } from '@/lib/stores/auth-store';

export const authenticatedAxiosInstance = axios.create();

// Request interceptor for API calls
authenticatedAxiosInstance.interceptors.request.use(
    async config => {
        if (config.headers.hasAuthorization()) {
            return config;
        }

        config.headers.setAuthorization(`Bearer ${useAuthStore().accessToken}`);
        return config;
    },
    error => {
        Promise.reject(error);
    }
);

// Response interceptor for API calls
authenticatedAxiosInstance.interceptors.response.use(
    response => {
        return response;
    },
    async function (error) {
        const originalRequest = error.config as AxiosRequestConfig & {
            _retry?: boolean;
        };

        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const privKey = useAuthStore().privateKey;
            if (!privKey) {
                useAuthStore().setData({ status: 'unauthenticated' });
                return Promise.reject(error);
            }

            const result = await refreshToken();

            if (!result.success) {
                return Promise.reject(error);
            }

            const crypto = CryptoWorker.instance;

            const decryptedAccessToken = await crypto.asymmetricDecrypt(
                result.data.encryptedAccessToken,
                result.data.accessTokenNonce,
                result.data.serverPublicKey,
                privKey
            );

            useAuthStore().setData({
                accessToken: decryptedAccessToken,
                status: 'authenticated',
            });

            axios.defaults.headers.common.Authorization = `Bearer ${decryptedAccessToken}`;
            return authenticatedAxiosInstance(originalRequest);
        }

        return Promise.reject(error);
    }
);
