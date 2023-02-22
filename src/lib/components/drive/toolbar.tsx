import * as Toolbar from '@radix-ui/react-toolbar';
import * as Tooltip from '@radix-ui/react-tooltip';
import clsx from 'clsx';
import { MouseEventHandler, SVGProps } from 'react';

export type ToolbarSeparator = {
    type: 'separator';
    id: string;
};

export type ToolbarItem = {
    type: 'item';
    name: string;
    action: MouseEventHandler<HTMLButtonElement> | undefined;
    icon: (props: Partial<SVGProps<SVGSVGElement>>) => JSX.Element;
    iconOnly: boolean;
    textOnly: boolean;
    variant: 'primary' | 'secondary' | 'danger';
};

export function DriveToolbar({
    items,
}: {
    items: (ToolbarItem | ToolbarSeparator)[];
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
                            className='mx-2.5 w-px bg-gray-300'
                        />
                    );
                }

                if (item.iconOnly) {
                    return (
                        <Tooltip.Root key={item.name}>
                            <Tooltip.Trigger asChild>
                                <Toolbar.Button
                                    onClick={item.action}
                                    className={clsx(
                                        'inline-flex flex-shrink-0 flex-grow-0 basis-auto items-center justify-center rounded px-2.5 py-1.5 text-sm leading-none text-white outline-none focus:relative focus:shadow',
                                        {
                                            'bg-red-600 hover:bg-red-800 focus:shadow-red-400':
                                                item.variant === 'danger',
                                            'bg-gray-600 hover:bg-gray-800 focus:shadow-gray-400':
                                                item.variant === 'secondary',
                                            'bg-brand-600 hover:bg-brand-800 focus:shadow-brand-400':
                                                !item.variant ||
                                                item.variant === 'primary',
                                        }
                                    )}>
                                    <item.icon className='h-4 w-4' />
                                    <span className='sr-only'>{item.name}</span>
                                </Toolbar.Button>
                            </Tooltip.Trigger>
                            <Tooltip.Portal>
                                <Tooltip.Content
                                    className={clsx(
                                        'select-none rounded-[4px] px-4 py-2.5 leading-none text-white shadow will-change-[transform,opacity] data-[state=delayed-open]:data-[side=top]:animate-slideDownAndFade data-[state=delayed-open]:data-[side=right]:animate-slideLeftAndFade data-[state=delayed-open]:data-[side=left]:animate-slideRightAndFade data-[state=delayed-open]:data-[side=bottom]:animate-slideUpAndFade',
                                        {
                                            'bg-red-600':
                                                item.variant === 'danger',
                                            'bg-gray-600':
                                                item.variant === 'secondary',
                                            'bg-brand-600':
                                                !item.variant ||
                                                item.variant === 'primary',
                                        }
                                    )}
                                    sideOffset={5}>
                                    {item.name}
                                    <Tooltip.Arrow
                                        className={clsx({
                                            'fill-red-600':
                                                item.variant === 'danger',
                                            'fill-gray-600':
                                                item.variant === 'secondary',
                                            'fill-brand-600':
                                                !item.variant ||
                                                item.variant === 'primary',
                                        })}
                                    />
                                </Tooltip.Content>
                            </Tooltip.Portal>
                        </Tooltip.Root>
                    );
                }

                if (item.textOnly) {
                    return (
                        <Tooltip.Root key={item.name}>
                            <Tooltip.Trigger asChild>
                                <Toolbar.Button
                                    onClick={item.action}
                                    className={clsx(
                                        'inline-flex flex-shrink-0 flex-grow-0 basis-auto items-center justify-center rounded px-2.5 py-1.5 text-sm leading-none text-white outline-none focus:relative focus:shadow',
                                        {
                                            'bg-red-600 hover:bg-red-800 focus:shadow-red-400':
                                                item.variant === 'danger',
                                            'bg-gray-600 hover:bg-gray-800 focus:shadow-gray-400':
                                                item.variant === 'secondary',
                                            'bg-brand-600 hover:bg-brand-800 focus:shadow-brand-400':
                                                !item.variant ||
                                                item.variant === 'primary',
                                        }
                                    )}>
                                    <span>{item.name}</span>
                                </Toolbar.Button>
                            </Tooltip.Trigger>
                            <Tooltip.Portal>
                                <Tooltip.Content
                                    className={clsx(
                                        'select-none rounded-[4px] px-4 py-2.5 leading-none text-white shadow will-change-[transform,opacity] data-[state=delayed-open]:data-[side=top]:animate-slideDownAndFade data-[state=delayed-open]:data-[side=right]:animate-slideLeftAndFade data-[state=delayed-open]:data-[side=left]:animate-slideRightAndFade data-[state=delayed-open]:data-[side=bottom]:animate-slideUpAndFade',
                                        {
                                            'bg-red-600':
                                                item.variant === 'danger',
                                            'bg-gray-60':
                                                item.variant === 'secondary',
                                            'bg-brand-600':
                                                !item.variant ||
                                                item.variant === 'primary',
                                        }
                                    )}
                                    sideOffset={5}>
                                    {item.name}
                                    <Tooltip.Arrow
                                        className={clsx({
                                            'fill-red-600':
                                                item.variant === 'danger',
                                            'fill-gray-600':
                                                item.variant === 'secondary',
                                            'fill-brand-600':
                                                !item.variant ||
                                                item.variant === 'primary',
                                        })}
                                    />
                                </Tooltip.Content>
                            </Tooltip.Portal>
                        </Tooltip.Root>
                    );
                }

                return (
                    <Toolbar.Button
                        key={item.name}
                        onClick={item.action}
                        className={clsx(
                            'inline-flex flex-shrink-0 flex-grow-0 basis-auto items-center justify-center gap-1 rounded px-2.5 py-1.5 text-sm leading-none text-white outline-none focus:relative focus:shadow',
                            {
                                'bg-red-600 hover:bg-red-800 focus:shadow-red-400':
                                    item.variant === 'danger',
                                'bg-gray-600 hover:bg-gray-800 focus:shadow-gray-400':
                                    item.variant === 'secondary',
                                'bg-brand-600 hover:bg-brand-800 focus:shadow-brand-400':
                                    !item.variant || item.variant === 'primary',
                            }
                        )}>
                        <item.icon className='h-4 w-4' />
                        <span>{item.name}</span>
                    </Toolbar.Button>
                );
            })}
        </Toolbar.Root>
    );
}
