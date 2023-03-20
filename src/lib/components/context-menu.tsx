import * as RadixContextMenu from '@radix-ui/react-context-menu';

import { MenuItem, MenuSeparator } from '@/lib/types/menu';
import { cn } from '@/lib/utils/cn';

export function ContextMenu({
    items,
}: {
    items: (MenuItem | MenuSeparator)[];
}) {
    return (
        <RadixContextMenu.Portal>
            <RadixContextMenu.Content className='min-w-[192px] overflow-hidden rounded-md border border-gray-300 bg-white p-[5px] shadow-xl'>
                {items.map(item => {
                    if (item.type === 'separator') {
                        return (
                            <RadixContextMenu.Separator
                                key={item.id}
                                className='m-[5px] h-[1px] bg-gray-300'
                            />
                        );
                    }

                    return (
                        <RadixContextMenu.Item
                            key={item.name}
                            onSelect={item.action}
                            disabled={item.disabled}
                            className={cn(
                                'relative flex select-none items-center gap-1 rounded-sm py-2 pr-1 pl-3 text-sm leading-none outline-none data-[disabled]:pointer-events-none data-[disabled]:text-gray-300',
                                {
                                    'text-red-700 data-[highlighted]:bg-red-200 data-[highlighted]:text-red-700':
                                        item.variant === 'danger',
                                    'text-gray-700 data-[highlighted]:bg-gray-200 data-[highlighted]:text-gray-700':
                                        item.variant === 'secondary',
                                    'text-brand-700 data-[highlighted]:bg-brand-200 data-[highlighted]:text-brand-700':
                                        !item.variant ||
                                        item.variant === 'primary',
                                },
                                item.className
                            )}>
                            <item.icon
                                className={cn('h-4 w-4', {
                                    hidden: item.textOnly,
                                })}
                            />
                            <span>{item.name}</span>
                        </RadixContextMenu.Item>
                    );
                })}
            </RadixContextMenu.Content>
        </RadixContextMenu.Portal>
    );
}
