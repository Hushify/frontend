import { useQuery } from '@tanstack/react-query';

import { apiRoutes } from '@/lib/data/routes';
import { CryptoWorkerInstance } from '@/lib/services/comlink-crypto';
import { list } from '@/lib/services/drive';

export function useDriveList(
    currentFolderId: string | null,
    accessToken: string,
    masterKey: string
) {
    const queryKey = currentFolderId
        ? `${apiRoutes.drive.list}?folderId=${currentFolderId}`
        : apiRoutes.drive.list;

    return useQuery([queryKey], () => list(queryKey, accessToken, masterKey, CryptoWorkerInstance));
}
