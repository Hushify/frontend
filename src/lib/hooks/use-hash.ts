import { useEffect, useState } from 'react';

export function useHash() {
    const [hash, setHash] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        setHash(window.location.hash.slice(1));

        const hashChangeHandler = () => {
            setHash(window.location.hash.slice(1));
        };

        window.addEventListener('hashchange', hashChangeHandler);

        return () =>
            window.removeEventListener('hashchange', hashChangeHandler);
    }, []);

    return hash;
}
