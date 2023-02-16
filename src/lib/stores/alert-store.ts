import { v4 } from 'uuid';
import { create } from 'zustand';

export type AlertType = 'warning' | 'success' | 'error' | 'info';

export type Alert = { id: string; message: string; type: AlertType };

export type AlertState = {
    alerts: Alert[];
};

export type AlertActions = {
    removeAlert: (id: string) => void;
    addAlert: (message: string, type?: AlertType, dismissInMs?: number) => void;
};

const initialAlertState: AlertState = {
    alerts: [],
};

export const useAlertStore = create<AlertState & AlertActions>()(
    (set, get) => ({
        ...initialAlertState,
        addAlert: (message, type = 'info', dismissInMs = 3000) => {
            const id = v4();
            set({ alerts: [{ id, message, type }, ...get().alerts] });
            setTimeout(() => get().removeAlert(id), dismissInMs);
        },
        removeAlert: id =>
            set({ alerts: get().alerts.filter(alert => alert.id !== id) }),
    })
);
