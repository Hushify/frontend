import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { withStorageEvents } from '@/lib/stores/with-storage-events';

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

withStorageEvents(usePrefStore);
