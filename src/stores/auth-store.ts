import { apiRoutes } from '@/data/routes';
import { logout } from '@/services/auth';
import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type AuthStatus =
    | 'unauthenticated'
    | 'authenticated'
    | 'loading'
    | 'loggingout';

export type AuthState = {
    accessToken?: string;
    masterKey?: string;
    asymmetricEncPrivateKey?: string;
    asymmetricEncPublicKey?: string;
    signingPublicKey?: string;
    signingPrivateKey?: string;
    status: AuthStatus;
};

export type AuthActions = {
    setAccessToken: (accessToken: string | undefined) => void;
    setMasterKey: (masterKey: string | undefined) => void;
    setAsymmetricEncKeyPair: (
        asymmetricEncPublicKey: string | undefined,
        asymmetricEncPrivateKey: string | undefined
    ) => void;
    setSigningKeyPair: (
        signingPublicKey: string | undefined,
        signingPrivateKey: string | undefined
    ) => void;
    setStatus: (status: AuthStatus) => void;
    logout: () => Promise<void>;
};

const initialAuthState: AuthState = {
    accessToken: undefined,
    masterKey: undefined,

    asymmetricEncPrivateKey: undefined,
    asymmetricEncPublicKey: undefined,

    signingPublicKey: undefined,
    signingPrivateKey: undefined,

    status: 'unauthenticated',
};

export const useAuthStore = create<AuthState & AuthActions>()(
    devtools(
        persist(
            (set, _get) => ({
                ...initialAuthState,

                setAccessToken: (accessToken: string | undefined) =>
                    set({ accessToken }),

                setMasterKey: (masterKey: string | undefined) =>
                    set({ masterKey }),

                setAsymmetricEncKeyPair: (
                    asymmetricEncPublicKey: string | undefined,
                    asymmetricEncPrivateKey: string | undefined
                ) => set({ asymmetricEncPublicKey, asymmetricEncPrivateKey }),

                setSigningKeyPair: (
                    signingPublicKey: string | undefined,
                    signingPrivateKey: string | undefined
                ) => set({ signingPublicKey, signingPrivateKey }),

                setStatus: (status: AuthStatus) => set({ status }),

                logout: async () => {
                    set({ ...initialAuthState, status: 'loggingout' });
                    try {
                        await logout(apiRoutes.identity.logout);
                    } catch {
                        /* empty */
                    }
                    set(initialAuthState);
                },
            }),
            {
                name: 'auth-store',
                partialize: state => ({
                    masterKey: state.masterKey,
                    asymmetricEncPublicKey: state.asymmetricEncPublicKey,
                    asymmetricEncPrivateKey: state.asymmetricEncPrivateKey,
                    signingPublicKey: state.signingPublicKey,
                    signingPrivateKey: state.signingPrivateKey,
                    status: state.status,
                }),
            }
        ),
        {
            name: 'auth-store',
            enabled: process.env.NODE_ENV === 'development',
        }
    )
);

const withStorageDOMEvents = (store: typeof useAuthStore) => {
    const storageEventCallback = (e: StorageEvent) => {
        if (e.key === store.persist.getOptions().name && e.newValue) {
            store.persist.rehydrate();
        }
    };

    if (typeof window === 'undefined') {
        return () => {};
    }

    window.addEventListener('storage', storageEventCallback);

    return () => {
        window.removeEventListener('storage', storageEventCallback);
    };
};

withStorageDOMEvents(useAuthStore);
