import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Toolbar from '@radix-ui/react-toolbar';
import { ChevronDown } from 'lucide-react';

import { MenuItem, MenuSeparator } from '@/lib/components/drive/types/menu';
import { cn } from '@/lib/utils/cn';

export function DriveToolbar({
    items,
}: {
    items: (MenuItem | MenuSeparator)[];
}) {
    return (
        <div className='flex w-full gap-2 overflow-x-auto border-b border-b-gray-300 py-2 px-5'>
            <Toolbar.Root className='hidden gap-2 md:flex' aria-label='Toolbar'>
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
                                        !item.variant ||
                                        item.variant === 'primary',
                                },
                                item.className
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

            <div className='md:hidden'>
                <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                        <button className='inline-flex shrink-0 grow-0 basis-auto items-center justify-center gap-1 rounded bg-gray-600 px-2.5 py-1.5 text-sm leading-none text-white outline-none hover:bg-gray-800 focus:shadow focus:shadow-gray-400'>
                            <span>Menu</span>
                            <ChevronDown className='h-4 w-4 data-[state=open]:rotate-180' />
                        </button>
                    </DropdownMenu.Trigger>

                    <DropdownMenu.Portal>
                        <DropdownMenu.Content
                            align='start'
                            className='min-w-[220px] rounded-md border border-gray-300 bg-white p-1 shadow-xl data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade'
                            sideOffset={5}>
                            {items.map(item => {
                                if (item.type === 'separator') {
                                    return (
                                        <DropdownMenu.Separator
                                            key={item.id}
                                            className='m-[5px] h-[1px] bg-gray-300'
                                        />
                                    );
                                }

                                return (
                                    <DropdownMenu.Item
                                        key={item.name}
                                        onSelect={item.action}
                                        disabled={item.disabled}
                                        className={cn(
                                            'relative flex select-none items-center gap-1 rounded-sm py-2 pr-1 pl-6 text-sm leading-none outline-none data-[disabled]:pointer-events-none data-[disabled]:text-gray-300',
                                            {
                                                'text-red-700 data-[highlighted]:bg-red-200 data-[highlighted]:text-red-700':
                                                    item.variant === 'danger',
                                                'text-gray-700 data-[highlighted]:bg-gray-200 data-[highlighted]:text-gray-700':
                                                    item.variant ===
                                                    'secondary',
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
                                    </DropdownMenu.Item>
                                );
                            })}
                        </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                </DropdownMenu.Root>
            </div>
        </div>
    );
}
