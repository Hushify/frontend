import * as ContextMenu from '@radix-ui/react-context-menu';

import { MenuItem, MenuSeparator } from '@/lib/components/drive/types/menu';
import { cn } from '@/lib/utils/cn';

export function DriveContextMenu({
    items,
}: {
    items: (MenuItem | MenuSeparator)[];
}) {
    return (
        <ContextMenu.Portal>
            <ContextMenu.Content className='min-w-[192px] overflow-hidden rounded-md bg-white p-[5px] shadow-md'>
                {items.map(item => {
                    if (item.type === 'separator') {
                        return (
                            <ContextMenu.Separator
                                key={item.id}
                                className='m-[5px] h-[1px] bg-gray-300'
                            />
                        );
                    }

                    return (
                        <ContextMenu.Item
                            key={item.name}
                            onSelect={item.action}
                            disabled={item.disabled}
                            className={cn(
                                'relative flex select-none items-center gap-1 rounded-sm py-2 pr-1 pl-6 text-sm leading-none outline-none data-[disabled]:pointer-events-none data-[disabled]:text-gray-300',
                                {
                                    'text-red-700 data-[highlighted]:bg-red-200 data-[highlighted]:text-red-700':
                                        item.variant === 'danger',
                                    'text-gray-700 data-[highlighted]:bg-gray-200 data-[highlighted]:text-gray-700':
                                        item.variant === 'secondary',
                                    'text-brand-700 data-[highlighted]:bg-brand-200 data-[highlighted]:text-brand-700':
                                        !item.variant ||
                                        item.variant === 'primary',
                                }
                            )}>
                            <item.icon
                                className={cn('h-4 w-4', {
                                    hidden: item.textOnly,
                                })}
                            />
                            <span>{item.name}</span>
                        </ContextMenu.Item>
                    );
                })}
            </ContextMenu.Content>
        </ContextMenu.Portal>
    );
}
