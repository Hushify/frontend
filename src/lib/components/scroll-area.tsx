import { ReactNode, RefAttributes } from 'react';
import {
    Corner,
    Root,
    ScrollAreaProps,
    Scrollbar,
    Thumb,
    Viewport,
} from '@radix-ui/react-scroll-area';

export function ScrollArea({
    children,
    ...props
}: ScrollAreaProps & {
    children: ReactNode;
} & RefAttributes<HTMLDivElement>) {
    return (
        <Root className='w-full overflow-hidden' {...props}>
            {children}
            <Scrollbar
                className='flex touch-none select-none bg-gray-200 p-0.5 transition-colors duration-150 ease-out hover:bg-gray-400 data-[orientation=horizontal]:h-2.5 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col'
                orientation='vertical'>
                <Thumb className="relative flex-1 rounded-[10px] bg-gray-500 before:absolute before:left-1/2 before:top-1/2 before:h-full before:min-h-[44px] before:w-full before:min-w-[44px] before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']" />
            </Scrollbar>
            <Scrollbar
                className='flex touch-none select-none bg-gray-200 p-0.5 transition-colors duration-150 ease-out hover:bg-gray-400 data-[orientation=horizontal]:h-2.5 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col'
                orientation='horizontal'>
                <Thumb className="relative flex-1 rounded-[10px] bg-gray-500 before:absolute before:left-1/2 before:top-1/2 before:h-full before:min-h-[44px] before:w-full before:min-w-[44px] before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']" />
            </Scrollbar>
            <Corner className='bg-gray-500' />
        </Root>
    );
}

ScrollArea.Viewport = Viewport;
