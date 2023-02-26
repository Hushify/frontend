import Link from 'next/link';

import { Logo } from '@/lib/components/logo';
import { clientRoutes } from '@/lib/data/routes';

export function Navbar() {
    return (
        <nav className='fixed z-10 h-16 w-full shrink-0 bg-offwhite/75 shadow backdrop-blur'>
            <div className='container mx-auto flex h-full items-center justify-between p-4'>
                <Link href='/' className='flex items-center gap-1.5 lg:gap-2'>
                    <Logo className='w-6' />
                    <span className='text-2xl font-medium'>Hushify</span>
                </Link>
                <ul className='flex items-center justify-center gap-4 md:gap-8'>
                    <li>
                        <Link
                            href={clientRoutes.blog.index}
                            className='text-lg hover:underline'>
                            Blog
                        </Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
}
