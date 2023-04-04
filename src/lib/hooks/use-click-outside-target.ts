import { useEffect, useRef } from 'react';

export function useClickOutsideTarget<T extends HTMLElement>(
    selector: string,
    clickOutsideCb: () => void
) {
    const ref = useRef<T>(null);

    useEffect(() => {
        const innerRef = ref.current;

        if (!innerRef) {
            return;
        }

        const listener = (event: MouseEvent | TouchEvent) => {
            if (!selector || !event.target) {
                return null;
            }

            const nodes = document.querySelectorAll(selector);
            if (nodes.length <= 0) {
                return null;
            }

            const target = event.target as HTMLElement;
            const isClickInside = Array.from(nodes).some(node => node.contains(target));
            if (!isClickInside) {
                clickOutsideCb();
            }

            return null;
        };

        innerRef.addEventListener('mousedown', listener, {
            passive: true,
        });
        innerRef.addEventListener('touchstart', listener, {
            passive: true,
        });

        return () => {
            innerRef.removeEventListener('mousedown', listener);
            innerRef.removeEventListener('touchstart', listener);
        };
    }, [selector, clickOutsideCb, ref]);

    return ref;
}
