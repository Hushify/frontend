import { clientRoutes } from '@/lib/data/routes';
import { BreadcrumbDecrypted } from '@/lib/services/drive';
import clsx from 'clsx';
import { Folder, HardDrive } from 'lucide-react';
import Link from 'next/link';

type BreadcrumbsProps = {
    items: BreadcrumbDecrypted[];
};

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
    return (
        <ul className='flex items-center py-2 px-6 text-gray-600'>
            <li>
                <Link
                    href={clientRoutes.drive}
                    className={clsx('flex items-center gap-1', {
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
                        className={clsx(
                            'flex items-center gap-1 before:mx-2 before:text-gray-400 before:content-["/"]',
                            {
                                'text-brand-600': idx === items.length - 1,
                            }
                        )}>
                        <Folder className='h-4 w-4' />
                        <span>{item.metadata.name}</span>
                    </Link>
                </li>
            ))}
        </ul>
    );
}
