import { withStorageDOMEvents } from '@/lib/stores/withStorageDOMEvents';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PrefState = {
    sidebarOpen?: boolean;
};

export type PrefActions = {
    setSidebarOpen: (sidebarOpen: boolean) => void;
};

const initialState: PrefState = {
    sidebarOpen: true,
};

export const usePrefStore = create<PrefState & PrefActions>()(
    persist(
        (set, _get) => ({
            ...initialState,

            setSidebarOpen: (sidebarOpen: boolean) => set({ sidebarOpen }),
        }),
        {
            name: 'pref-store',
        }
    )
);

withStorageDOMEvents(usePrefStore);
