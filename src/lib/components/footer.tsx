import Link from 'next/link';
import { Github, Twitter } from 'lucide-react';

import { clientRoutes } from '@/lib/data/routes';

const navigation = [
    { name: 'Blog', href: clientRoutes.blog.index },
    { name: 'Security', href: clientRoutes.security },
    { name: 'About', href: clientRoutes.about },
    { name: 'Legal', href: clientRoutes.legal.index },
];

export function Footer() {
    return (
        <footer className='mx-auto max-w-7xl overflow-hidden px-6 py-12 lg:px-8'>
            <nav
                className='-mb-6 columns-2 sm:flex sm:justify-center sm:space-x-12'
                aria-label='Footer'>
                {navigation.map(item => (
                    <div key={item.name} className='pb-6'>
                        <Link
                            href={item.href}
                            className='text-sm leading-6 text-gray-600 hover:text-gray-900'>
                            {item.name}
                        </Link>
                    </div>
                ))}
            </nav>
            <div className='mt-10 flex justify-center space-x-10'>
                <Link
                    href='https://github.com/Hushify'
                    target='_blank'
                    rel='noreferrer'
                    className='text-gray-400 hover:text-gray-500'>
                    <span className='sr-only'>Github</span>
                    <Github className='h-6 w-6' aria-hidden='true' />
                </Link>
                <Link
                    href='https://twitter.com/HushifyIO'
                    target='_blank'
                    rel='noreferrer'
                    className='text-gray-400 hover:text-gray-500'>
                    <span className='sr-only'>Twitter</span>
                    <Twitter className='h-6 w-6' aria-hidden='true' />
                </Link>
            </div>
            <p className='mt-10 text-center text-xs leading-5 text-gray-500'>
                &copy; 2023 Hushify. All rights reserved.
            </p>
        </footer>
    );
}
