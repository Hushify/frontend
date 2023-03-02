import Link from 'next/link';
import { Folder, FolderOpen, HardDrive } from 'lucide-react';

import { clientRoutes } from '@/lib/data/routes';
import { BreadcrumbDecrypted } from '@/lib/services/drive';
import { cn } from '@/lib/utils/cn';

type BreadcrumbsProps = {
    items: BreadcrumbDecrypted[];
};

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
    return (
        <ul className='flex flex-wrap items-center border-b border-b-gray-300 py-2 px-6 text-gray-600'>
            <li>
                <Link
                    href={clientRoutes.drive}
                    className={cn('flex items-center gap-1', {
                        'text-brand-600': items.length === 0,
                    })}>
                    <HardDrive className='h-4 w-4' />
                    <span>Home</span>
                </Link>
            </li>
            {items.map((item, idx) => (
                <li key={item.id}>
                    <Link
                        href={`${clientRoutes.drive}/${item.id}`}
                        className={cn(
                            'flex items-center gap-1 before:mx-2 before:text-gray-400 before:content-["|"]',
                            {
                                'text-brand-600': idx === items.length - 1,
                            }
                        )}>
                        {idx === items.length - 1 ? (
                            <FolderOpen className='h-4 w-4' />
                        ) : (
                            <Folder className='h-4 w-4' />
                        )}
                        <span>{item.metadata.name}</span>
                    </Link>
                </li>
            ))}
        </ul>
    );
}
