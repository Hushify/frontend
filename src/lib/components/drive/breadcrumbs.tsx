import Link from 'next/link';
import { UseMutateAsyncFunction } from '@tanstack/react-query';

import { clientRoutes } from '@/lib/data/routes';
import { useDrop } from '@/lib/hooks/drive/use-drop';
import { useAuthStore } from '@/lib/stores/auth-store';
import {
    BreadcrumbDecrypted,
    FileNodeDecrypted,
    FolderNodeDecrypted,
    SelectedNode,
} from '@/lib/types/drive';
import { cn } from '@/lib/utils/cn';

type BreadcrumbsProps = {
    items: BreadcrumbDecrypted[];
    onMove: UseMutateAsyncFunction<
        void,
        unknown,
        {
            items: (
                | { node: FolderNodeDecrypted; type: 'folder' }
                | { node: FileNodeDecrypted; type: 'file' }
            )[];
            destinationFolderId: string;
            destinationFolderKey: string;
        },
        unknown
    >;
    workspaceId: string | undefined;
};

export function Breadcrumbs({ items, onMove, workspaceId }: BreadcrumbsProps) {
    return (
        <ul className='flex flex-wrap items-center gap-2 border-b border-b-gray-300 py-2 px-4 text-gray-700'>
            <MainCrumb workspaceId={workspaceId} totalItems={items.length} onMove={onMove} />
            {items.map((item, idx) => (
                <Crumb
                    key={item.id}
                    item={item}
                    idx={idx}
                    totalItems={items.length}
                    onMove={onMove}
                />
            ))}
        </ul>
    );
}

function MainCrumb({
    workspaceId,
    totalItems,
    onMove,
}: {
    workspaceId: string | undefined;
    totalItems: number;
    onMove: UseMutateAsyncFunction<
        void,
        unknown,
        {
            items: SelectedNode[];
            destinationFolderId: string;
            destinationFolderKey: string;
        },
        unknown
    >;
}) {
    const masterKey = useAuthStore(state => state.masterKey);
    const { drop, dropProps } = useDrop(
        workspaceId ?? '',
        masterKey ?? '',
        () => totalItems > 0,
        onMove
    );

    return (
        <li
            className={cn('px-2', {
                'bg-brand-200': dropProps.isOver && dropProps.canDrop,
            })}
            ref={drop}>
            <Link
                href={clientRoutes.drive}
                className={cn({
                    'text-brand-700': totalItems === 0,
                })}>
                Home
            </Link>
        </li>
    );
}

function Crumb({
    item,
    idx,
    totalItems,
    onMove,
}: {
    item: BreadcrumbDecrypted;
    idx: number;
    totalItems: number;
    onMove: UseMutateAsyncFunction<
        void,
        unknown,
        {
            items: SelectedNode[];
            destinationFolderId: string;
            destinationFolderKey: string;
        },
        unknown
    >;
}) {
    const { drop, dropProps } = useDrop(item.id, item.key, () => idx !== totalItems - 1, onMove);

    return (
        <>
            <li>|</li>
            <li
                ref={drop}
                className={cn('px-2', {
                    'bg-brand-200 before:bg-transparent': dropProps.isOver && dropProps.canDrop,
                })}>
                <Link
                    href={`${clientRoutes.drive}/${item.id}`}
                    className={cn({
                        'text-brand-700': idx === totalItems - 1,
                    })}>
                    {item.metadata.name}
                </Link>
            </li>
        </>
    );
}
