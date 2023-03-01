import {
    MouseEventHandler,
    RefObject,
    TouchEventHandler,
    useEffect,
} from 'react';

export function useClickDirect(
    ref: RefObject<HTMLElement>,
    clickOutsideHandler: MouseEventHandler | TouchEventHandler
) {
    useEffect(() => {
        const listener = (event: any) => {
            if (!ref.current) {
                return null;
            }

            if (ref.current === event.target) {
                clickOutsideHandler(event);
            }
        };

        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);

        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, clickOutsideHandler]);
}
