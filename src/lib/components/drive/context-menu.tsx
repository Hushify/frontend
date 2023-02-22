import * as ContextMenu from '@radix-ui/react-context-menu';
import clsx from 'clsx';
import { SVGProps } from 'react';

export type ContextMenuSeparator = {
    type: 'separator';
    id: string;
};

export type ContextMenuItem = {
    type: 'item';
    name: string;
    action:
        | ((event: Event) => void)
        | ((event: Event) => Promise<void>)
        | undefined;
    icon: (props: Partial<SVGProps<SVGSVGElement>>) => JSX.Element;
    textOnly: boolean;
    variant: 'primary' | 'danger';
    disabled: boolean;
};

export function DriveContextMenu({
    items,
}: {
    items: (ContextMenuItem | ContextMenuSeparator)[];
}) {
    return (
        <ContextMenu.Portal>
            <ContextMenu.Content className='min-w-[220px] overflow-hidden rounded-md bg-white p-[5px] shadow-md'>
                {items.map(item => {
                    if (item.type === 'separator') {
                        return (
                            <ContextMenu.Separator
                                key={item.id}
                                className='m-[5px] h-[1px] bg-gray-300'
                            />
                        );
                    }

                    if (item.textOnly) {
                        return (
                            <ContextMenu.Item
                                key={item.name}
                                onSelect={item.action}
                                disabled={item.disabled}
                                className={clsx(
                                    'relative flex h-6 select-none items-center rounded-sm px-1 pl-6 text-sm leading-none outline-none data-[disabled]:pointer-events-none',
                                    {
                                        'text-red-600 data-[highlighted]:bg-red-200 data-[disabled]:text-gray-300 data-[highlighted]:text-red-600':
                                            item.variant === 'danger',
                                        'text-brand-600 data-[highlighted]:bg-brand-200 data-[disabled]:text-gray-300 data-[highlighted]:text-brand-600':
                                            !item.variant ||
                                            item.variant === 'primary',
                                    }
                                )}>
                                <span>{item.name}</span>
                            </ContextMenu.Item>
                        );
                    }

                    return (
                        <ContextMenu.Item
                            key={item.name}
                            onSelect={item.action}
                            disabled={item.disabled}
                            className={clsx(
                                'relative flex h-6 select-none items-center gap-1 rounded-sm px-1 pl-6 text-sm leading-none outline-none data-[disabled]:pointer-events-none',
                                {
                                    'text-red-600 data-[highlighted]:bg-red-200 data-[disabled]:text-gray-300 data-[highlighted]:text-red-600':
                                        item.variant === 'danger',
                                    'text-brand-600 data-[highlighted]:bg-brand-200 data-[disabled]:text-gray-300 data-[highlighted]:text-brand-600':
                                        !item.variant ||
                                        item.variant === 'primary',
                                }
                            )}>
                            <item.icon className='h-4 w-4' />
                            <span>{item.name}</span>
                        </ContextMenu.Item>
                    );
                })}
            </ContextMenu.Content>
        </ContextMenu.Portal>
    );
}
