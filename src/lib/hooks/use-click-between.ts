import { MouseEventHandler, RefObject, TouchEventHandler, useEffect } from 'react';

export function useClickBetween(
    outerRef: RefObject<HTMLElement>,
    innerRef: RefObject<HTMLElement>,
    clickOutsideHandler: MouseEventHandler | TouchEventHandler
) {
    useEffect(() => {
        const listener = (event: any) => {
            if (!outerRef.current || !innerRef.current) {
                return null;
            }

            if (
                outerRef.current.contains(event.target) &&
                !innerRef.current.contains(event.target)
            ) {
                clickOutsideHandler(event);
            }
        };

        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);

        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [outerRef, innerRef, clickOutsideHandler]);
}
