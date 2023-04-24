import Link from 'next/link';

import { clientRoutes } from '@/lib/data/routes';

export default function Home() {
    return (
        <div className='mx-auto max-w-prose py-6 lg:py-10'>
            <h1 className='text-center text-3xl font-bold'>Privacy, built on open source.</h1>
            <div className='mt-4 text-center'>
                <Link
                    href={clientRoutes.identity.register}
                    className='text-blue-500 hover:underline'>
                    Get Started
                </Link>
            </div>
        </div>
    );
}
