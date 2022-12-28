'use client';

import { apiRoutes } from '@/data/routes';
import { DriveList, list } from '@/services/drive';
import { useAuthStore } from '@/stores/auth-store';
import { useQuery } from '@tanstack/react-query';

export const useDriveList = (
    folderId?: string
): {
    data: DriveList | undefined;
    isLoading: boolean;
    error: unknown;
} => {
    const accessToken = useAuthStore(state => state.accessToken)!;
    const masterKey = useAuthStore(state => state.masterKey)!;

    const key = folderId
        ? `${apiRoutes.drive.list}?folderId=${folderId}`
        : apiRoutes.drive.list;

    const { data, error, isLoading } = useQuery([key], () =>
        list(key, accessToken, masterKey)
    );

    return {
        data,
        isLoading,
        error,
    };
};
