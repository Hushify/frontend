import { clientRoutes } from '@/lib/data/routes';
import Link from 'next/link';

export const Navbar = () => (
    <nav className='h-20 w-full shrink-0 bg-white shadow shadow-slate-200'>
        <div className='container mx-auto flex h-full items-center justify-between p-4'>
            <Link href='/'>
                <h1 className='text-2xl'>Hushify</h1>
            </Link>
            <ul className='flex items-center justify-center gap-4 md:gap-8'>
                <li>
                    <Link
                        href={clientRoutes.blog.index}
                        className='font-mono hover:underline'>
                        /blog
                    </Link>
                </li>
                <li>
                    <Link
                        href={clientRoutes.identity.login}
                        className='font-mono hover:underline'>
                        /login
                    </Link>
                </li>
            </ul>
        </div>
    </nav>
);
