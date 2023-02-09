import { Logo } from '@/lib/components/logo';
import { clientRoutes } from '@/lib/data/routes';
import Link from 'next/link';

export const Navbar = () => (
    <nav className='h-20 w-full shrink-0 bg-white shadow shadow-slate-200'>
        <div className='container mx-auto flex h-full items-center justify-between p-4'>
            <Link href='/' className='flex items-center gap-1'>
                <Logo className='w-12' />
                <span className='text-4xl'>Hushify</span>
            </Link>
            <ul className='flex items-center justify-center gap-4 md:gap-8'>
                <li>
                    <Link
                        href={clientRoutes.blog.index}
                        className='hover:underline'>
                        Blog
                    </Link>
                </li>
            </ul>
        </div>
    </nav>
);
