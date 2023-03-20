import Link from 'next/link';
import { UseMutateAsyncFunction } from '@tanstack/react-query';
import { Folder, FolderOpen, HardDrive } from 'lucide-react';
import { useMultiDrop } from 'react-dnd-multi-backend';

import { clientRoutes } from '@/lib/data/routes';
import { useAuthStore } from '@/lib/stores/auth-store';
import {
    BreadcrumbDecrypted,
    FileNodeDecrypted,
    FolderNodeDecrypted,
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

export default function Breadcrumbs({
    items,
    onMove,
    workspaceId,
}: BreadcrumbsProps) {
    return (
        <ul className='flex flex-wrap items-center gap-2 border-b border-b-gray-300 py-2 px-4 text-gray-700'>
            <MainCrumb
                workspaceId={workspaceId}
                totalItems={items.length}
                onMove={onMove}
            />
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
            items: (
                | { node: FolderNodeDecrypted; type: 'folder' }
                | { node: FileNodeDecrypted; type: 'file' }
            )[];
            destinationFolderId: string;
            destinationFolderKey: string;
        },
        unknown
    >;
}) {
    const masterKey = useAuthStore(state => state.masterKey);

    const [[dropProps, drop]] = useMultiDrop<
        unknown,
        unknown,
        { canDrop: boolean; isOver: boolean }
    >({
        accept: 'NODE',
        drop: async items => {
            onMove({
                items: items as (
                    | { node: FolderNodeDecrypted; type: 'folder' }
                    | { node: FileNodeDecrypted; type: 'file' }
                )[],
                destinationFolderId: workspaceId ?? '',
                destinationFolderKey: masterKey ?? '',
            });
        },
        canDrop: (_item: any) => totalItems > 0,
        collect: (monitor: any) => ({
            canDrop: monitor.canDrop(),
            isOver: monitor.isOver(),
        }),
    });

    if (!masterKey || !workspaceId) {
        return null;
    }

    return (
        <li
            className={cn('px-2', {
                'bg-brand-200': dropProps.isOver && dropProps.canDrop,
            })}
            ref={drop}>
            <Link
                href={clientRoutes.drive}
                className={cn('flex items-center gap-1', {
                    'text-brand-700': totalItems === 0,
                })}>
                <HardDrive className='hidden h-4 w-4' />
                <span>Home</span>
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
            items: (
                | { node: FolderNodeDecrypted; type: 'folder' }
                | { node: FileNodeDecrypted; type: 'file' }
            )[];
            destinationFolderId: string;
            destinationFolderKey: string;
        },
        unknown
    >;
}) {
    const [[dropProps, drop]] = useMultiDrop<
        unknown,
        unknown,
        { canDrop: boolean; isOver: boolean }
    >({
        accept: 'NODE',
        drop: async items => {
            onMove({
                items: items as (
                    | { node: FolderNodeDecrypted; type: 'folder' }
                    | { node: FileNodeDecrypted; type: 'file' }
                )[],
                destinationFolderId: item.id,
                destinationFolderKey: item.key,
            });
        },
        canDrop: (_item: any) => idx !== totalItems - 1,
        collect: (monitor: any) => ({
            canDrop: monitor.canDrop(),
            isOver: monitor.isOver(),
        }),
    });

    return (
        <>
            <li>|</li>
            <li
                ref={drop}
                className={cn('px-2', {
                    'bg-brand-200 before:bg-transparent':
                        dropProps.isOver && dropProps.canDrop,
                })}>
                <Link
                    href={`${clientRoutes.drive}/${item.id}`}
                    className={cn('flex items-center gap-1', {
                        'text-brand-700': idx === totalItems - 1,
                    })}>
                    {idx === totalItems - 1 ? (
                        <FolderOpen className='hidden h-4 w-4' />
                    ) : (
                        <Folder className='hidden h-4 w-4' />
                    )}
                    <span>{item.metadata.name}</span>
                </Link>
            </li>
        </>
    );
}
