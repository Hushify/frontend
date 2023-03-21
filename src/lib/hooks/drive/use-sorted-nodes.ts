import { useMemo, useState } from 'react';
import orderBy from 'lodash/orderBy';

import { DriveList, FileMetadata, FolderMetadata } from '@/lib/types/drive';

export function useSortedNodes(data: DriveList | undefined) {
    const [sortKey, setSortKey] = useState<keyof FolderMetadata | keyof FileMetadata>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const folders = useMemo(() => {
        if (!data) {
            return [];
        }
        if (sortKey === 'name') {
            return data.folders.sort((a, b) => {
                return (
                    a.metadata.name.localeCompare(b.metadata.name, 'en', {
                        numeric: true,
                    }) * (sortOrder === 'asc' ? 1 : -1)
                );
            });
        }
        return orderBy(
            data.folders,
            f =>
                Object.keys(f.metadata).includes(sortKey)
                    ? f.metadata[sortKey as keyof FolderMetadata]
                    : f.metadata.name,
            [sortOrder]
        );
    }, [data, sortKey, sortOrder]);

    const files = useMemo(() => {
        if (!data) {
            return [];
        }

        if (sortKey === 'name') {
            return data.files.sort((a, b) => {
                return (
                    a.metadata.name.localeCompare(b.metadata.name, 'en', {
                        numeric: true,
                    }) * (sortOrder === 'asc' ? 1 : -1)
                );
            });
        }
        return orderBy(
            data.files,
            f =>
                Object.keys(f.metadata).includes(sortKey)
                    ? f.metadata[sortKey as keyof FileMetadata]
                    : f.metadata.name,
            [sortOrder]
        );
    }, [data, sortKey, sortOrder]);

    return { sortKey, setSortKey, sortOrder, setSortOrder, files, folders };
}
