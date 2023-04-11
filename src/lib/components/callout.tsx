import { ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

type Props = {
    icon?: string;
    children?: ReactNode;
    type?: 'default' | 'warning' | 'danger';
};

export function Callout({ children, icon, type = 'default', ...props }: Props) {
    return (
        <div
            className={cn('my-6 flex items-start rounded-md border border-l-4 px-4', {
                'border-gray-900 bg-gray-50': type === 'default',
                'border-red-900 bg-red-50': type === 'danger',
                'border-yellow-900 bg-yellow-50': type === 'warning',
            })}
            {...props}>
            {icon && <span className='mr-4 text-2xl'>{icon}</span>}
            <div>{children}</div>
        </div>
    );
}
