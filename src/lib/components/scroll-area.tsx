import { ReactNode, RefAttributes } from 'react';
import * as RadixScrollArea from '@radix-ui/react-scroll-area';

export function ScrollArea({
    children,
    ...props
}: RadixScrollArea.ScrollAreaProps & {
    children: ReactNode;
} & RefAttributes<HTMLDivElement>) {
    return (
        <RadixScrollArea.Root className='w-full overflow-hidden' {...props}>
            {children}
            <RadixScrollArea.Scrollbar
                className='flex touch-none select-none bg-gray-200 p-0.5 transition-colors duration-150 ease-out hover:bg-gray-400 data-[orientation=horizontal]:h-2.5 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col'
                orientation='vertical'>
                <RadixScrollArea.Thumb className="relative flex-1 rounded-[10px] bg-gray-500 before:absolute before:top-1/2 before:left-1/2 before:h-full before:min-h-[44px] before:w-full before:min-w-[44px] before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']" />
            </RadixScrollArea.Scrollbar>
            <RadixScrollArea.Scrollbar
                className='flex touch-none select-none bg-gray-200 p-0.5 transition-colors duration-150 ease-out hover:bg-gray-400 data-[orientation=horizontal]:h-2.5 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col'
                orientation='horizontal'>
                <RadixScrollArea.Thumb className="relative flex-1 rounded-[10px] bg-gray-500 before:absolute before:top-1/2 before:left-1/2 before:h-full before:min-h-[44px] before:w-full before:min-w-[44px] before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']" />
            </RadixScrollArea.Scrollbar>
            <RadixScrollArea.Corner className='bg-gray-500' />
        </RadixScrollArea.Root>
    );
}

ScrollArea.Viewport = RadixScrollArea.Viewport;

ScrollArea.displayName = 'ScrollArea';
