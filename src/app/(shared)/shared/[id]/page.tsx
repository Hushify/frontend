'use client';

import { useHash } from '@/lib/hooks/use-hash';

function Shared({ params: { id } }: { params: { id: string } }) {
    const hash = useHash();

    if (!hash) {
        return null;
    }

    return (
        <table className='prose prose-base m-8 mx-auto text-left'>
            <thead>
                <tr>
                    <th>Node Id</th>
                    <th>Node Key</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{id}</td>
                    <td>{hash}</td>
                </tr>
            </tbody>
        </table>
    );
}

export default Shared;
