import * as Toolbar from '@radix-ui/react-toolbar';

import { MenuItem, MenuSeparator } from '@/lib/components/drive/types/menu';
import { cn } from '@/lib/utils/cn';

export function DriveToolbar({
    items,
}: {
    items: (MenuItem | MenuSeparator)[];
}) {
    return (
        <Toolbar.Root
            className='flex w-full gap-2 overflow-x-auto border-b border-b-gray-300 p-2'
            aria-label='Toolbar'>
            {items.map(item => {
                if (item.type === 'separator') {
                    return (
                        <Toolbar.Separator
                            key={item.id}
                            className='w-px bg-gray-300'
                        />
                    );
                }

                return (
                    <Toolbar.Button
                        key={item.name}
                        onClick={item.action}
                        className={cn(
                            'inline-flex shrink-0 grow-0 basis-auto items-center justify-center gap-1 rounded px-2.5 py-1.5 text-sm leading-none text-white outline-none focus:relative focus:shadow',
                            {
                                'bg-red-600 hover:bg-red-800 focus:shadow-red-400':
                                    item.variant === 'danger',
                                'bg-gray-600 hover:bg-gray-800 focus:shadow-gray-400':
                                    item.variant === 'secondary',
                                'bg-brand-600 hover:bg-brand-800 focus:shadow-brand-400':
                                    !item.variant || item.variant === 'primary',
                            }
                        )}>
                        <item.icon
                            className={cn('h-4 w-4', {
                                ['hidden']: item.textOnly,
                            })}
                        />
                        <span>{item.name}</span>
                    </Toolbar.Button>
                );
            })}
        </Toolbar.Root>
    );
}
