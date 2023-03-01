import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { apiRoutes } from '@/lib/data/routes';
import { logout } from '@/lib/services/auth';
import { withStorageDOMEvents } from '@/lib/stores/withStorageDOMEvents';

export type AuthStatus =
    | 'unauthenticated'
    | 'authenticated'
    | 'loading'
    | 'loggingout';

export type AuthState = {
    accessToken: string | null;
    masterKey: string | null;
    privateKey: string | null;
    publicKey: string | null;
    signingPublicKey: string | null;
    signingPrivateKey: string | null;
    recoveryKeyMnemonic: string | null;
    status: AuthStatus;
};

export type AuthActions = {
    setData: (data: Partial<AuthState>) => void;
    hasRequiredKeys: () => boolean;
    isLoggedIn: () => boolean;
    logout: () => Promise<void>;
};

const initialAuthState: AuthState = {
    accessToken: null,
    masterKey: null,

    privateKey: null,
    publicKey: null,

    signingPublicKey: null,
    signingPrivateKey: null,

    recoveryKeyMnemonic: null,

    status: 'unauthenticated',
};

export const useAuthStore = create<AuthState & AuthActions>()(
    persist(
        (set, get) => ({
            ...initialAuthState,

            setData: data => set({ ...data }),

            hasRequiredKeys: () => {
                const { masterKey, privateKey, signingPrivateKey } = get();
                return !!(masterKey && privateKey && signingPrivateKey);
            },

            isLoggedIn: () =>
                get().hasRequiredKeys() && get().status === 'authenticated',

            logout: async () => {
                set({ ...initialAuthState, status: 'loggingout' });
                try {
                    await logout(apiRoutes.identity.logout);
                } catch {}
                set(initialAuthState);
            },
        }),
        {
            name: 'auth-store',
            partialize: state => ({
                masterKey: state.masterKey,
                privateKey: state.privateKey,
                signingPrivateKey: state.signingPrivateKey,
                status: state.status,
            }),
        }
    )
);

withStorageDOMEvents(useAuthStore);
