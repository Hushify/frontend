'use client';

import { AlertItem } from '@/lib/components/alert-item';
import { useAlertStore } from '@/lib/stores/alert-store';
import { shallow } from 'zustand/shallow';

export function AlertList() {
    const alertsStore = useAlertStore(state => state, shallow);

    return (
        <div
            className='fixed left-1/2 top-6 z-30 w-full max-w-xs -translate-x-1/2 space-y-4'
            role='alert'>
            {alertsStore.alerts.map(alert => (
                <AlertItem
                    key={alert.id}
                    alert={alert}
                    close={() => alertsStore.removeAlert(alert.id)}
                />
            ))}
        </div>
    );
}
