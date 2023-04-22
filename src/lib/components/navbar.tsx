import Link from 'next/link';

import { Logo } from '@/lib/components/logo';
import { clientRoutes } from '@/lib/data/routes';
import { cn } from '@/lib/utils/cn';

export function Navbar() {
    return (
        <nav className='fixed z-10 h-16 w-full shrink-0 bg-white/75 shadow backdrop-blur'>
            <div className='container mx-auto flex h-full items-center justify-between p-4'>
                <Link href='/' className='flex items-center gap-1.5 lg:gap-2'>
                    <Logo className='w-6' />
                    <span className='text-2xl font-medium'>Hushify</span>
                </Link>
                <ul className='flex items-center justify-center gap-4 md:gap-6'>
                    <li>
                        <Link
                            href={clientRoutes.blog.index}
                            className='text-lg duration-200 ease-out hover:text-brand-600'>
                            Blog
                        </Link>
                    </li>
                    <li>
                        <Link
                            href={clientRoutes.security}
                            className='text-lg duration-200 ease-out hover:text-brand-600'>
                            Security
                        </Link>
                    </li>
                    <li>
                        <Link
                            href={clientRoutes.about}
                            className='text-lg duration-200 ease-out hover:text-brand-600'>
                            About
                        </Link>
                    </li>
                    <li>
                        <Link
                            href={clientRoutes.legal}
                            className='text-lg duration-200 ease-out hover:text-brand-600'>
                            Legal
                        </Link>
                    </li>
                    <li>
                        <Link
                            href={clientRoutes.identity.login}
                            className='text-lg duration-200 ease-out hover:text-brand-600'>
                            Login
                        </Link>
                    </li>
                    <li>
                        <Link
                            href={clientRoutes.identity.register}
                            className={cn(
                                'flex items-center justify-center gap-2 rounded-lg px-4 py-1.5 font-medium',
                                'bg-brand-600 text-white focus-visible:ring-brand-600/75'
                            )}>
                            Get Started
                        </Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
}
