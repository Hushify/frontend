import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { logout } from '@/lib/services/auth';
import { withStorageEvents } from '@/lib/stores/with-storage-events';

export type AuthStatus = 'unauthenticated' | 'authenticated' | 'loading';

export type AuthState = {
    accessToken: string | null;
    masterKey: string | null;
    privateKey: string | null;
    publicKey: string | null;
    signingPublicKey: string | null;
    signingPrivateKey: string | null;
    recoveryKeyMnemonic: string | null;
    status: AuthStatus;
    email: string | null;
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

    email: null,
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

            isLoggedIn: () => get().hasRequiredKeys() && get().status === 'authenticated',

            logout: async () => {
                try {
                    await logout();
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
                email: state.email,
            }),
        }
    )
);

withStorageEvents(useAuthStore);
