import { MouseEventHandler, RefObject, TouchEventHandler, useEffect } from 'react';

// https://usehooks.com/useOnClickOutside/
export function useClickOutside(
    ref: RefObject<HTMLElement>,
    clickOutsideHandler: MouseEventHandler | TouchEventHandler
) {
    useEffect(() => {
        const listener = (event: any) => {
            if (!ref.current || ref.current.contains(event.target)) {
                return null;
            }

            clickOutsideHandler(event);
        };

        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);

        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, clickOutsideHandler]);
}
