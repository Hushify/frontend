'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Dialog } from '@headlessui/react';
import { Menu, X } from 'lucide-react';

import { Logo } from '@/lib/components/logo';
import { clientRoutes } from '@/lib/data/routes';
import { useAuthStore } from '@/lib/stores/auth-store';

const navigation = [
    { name: 'Blog', href: clientRoutes.blog.index },
    { name: 'Security', href: clientRoutes.security },
    { name: 'About', href: clientRoutes.about },
    { name: 'Legal', href: clientRoutes.legal },
];

export function Navbar() {
    const status = useAuthStore(state => state.status);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <>
            <div className='absolute inset-x-0 top-[-10rem] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[-20rem]'>
                <svg
                    className='relative left-[calc(50%-11rem)] -z-10 h-[21.1875rem] max-w-none -translate-x-1/2 rotate-[30deg] sm:left-[calc(50%-30rem)] sm:h-[42.375rem]'
                    viewBox='0 0 1155 678'>
                    <path
                        fill='url(#9b2541ea-d39d-499b-bd42-aeea3e93f5ff)'
                        fillOpacity='.3'
                        d='M317.219 518.975L203.852 678 0 438.341l317.219 80.634 204.172-286.402c1.307 132.337 45.083 346.658 209.733 145.248C936.936 126.058 882.053-94.234 1031.02 41.331c119.18 108.451 130.68 295.337 121.53 375.223L855 299l21.173 362.054-558.954-142.079z'
                    />
                    <defs>
                        <linearGradient
                            id='9b2541ea-d39d-499b-bd42-aeea3e93f5ff'
                            x1='1155.49'
                            x2='-78.208'
                            y1='.177'
                            y2='474.645'
                            gradientUnits='userSpaceOnUse'>
                            <stop stopColor='#9089FC' />
                            <stop offset={1} stopColor='#FF80B5' />
                        </linearGradient>
                    </defs>
                </svg>
            </div>
            <div className='px-6 pt-6 lg:px-8'>
                <nav
                    className='container mx-auto flex items-center justify-between'
                    aria-label='Global'>
                    <div className='flex lg:flex-1'>
                        <Link href='/' className='flex items-center gap-2 p-1.5'>
                            <Logo className='h-6' />
                            <span className='text-2xl font-medium'>Hushify</span>
                        </Link>
                    </div>
                    <div className='flex lg:hidden'>
                        <button
                            type='button'
                            className='inline-flex items-center justify-center rounded-md p-2.5 text-gray-700'
                            onClick={() => setMobileMenuOpen(true)}>
                            <span className='sr-only'>Open main menu</span>
                            <Menu className='h-6 w-6' aria-hidden='true' />
                        </button>
                    </div>
                    <div className='hidden lg:flex lg:gap-x-12'>
                        {navigation.map(item => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className='text-sm font-semibold leading-6 text-gray-900'>
                                {item.name}
                            </Link>
                        ))}
                    </div>
                    <div className='hidden lg:flex lg:flex-1 lg:justify-end'>
                        {status === 'authenticated' ? (
                            <Link
                                href={clientRoutes.drive}
                                className='text-sm font-semibold leading-6 text-gray-900'>
                                Drive <span aria-hidden='true'>&rarr;</span>
                            </Link>
                        ) : (
                            <Link
                                href={clientRoutes.identity.login}
                                className='text-sm font-semibold leading-6 text-gray-900'>
                                Login <span aria-hidden='true'>&rarr;</span>
                            </Link>
                        )}
                    </div>
                </nav>
                <Dialog as='div' open={mobileMenuOpen} onClose={setMobileMenuOpen}>
                    <Dialog.Panel
                        autoFocus
                        className='fixed inset-0 z-10 overflow-y-auto bg-white px-6 pt-6 lg:hidden'>
                        <div className='container mx-auto flex items-center justify-between'>
                            <Link
                                href='/'
                                className='flex items-center gap-2 p-1.5'
                                onClick={() => setMobileMenuOpen(false)}>
                                <Logo className='h-6' />
                                <span className='text-2xl font-medium'>Hushify</span>
                            </Link>
                            <button
                                type='button'
                                className='rounded-md p-2.5 text-gray-700'
                                onClick={() => setMobileMenuOpen(false)}>
                                <span className='sr-only'>Close menu</span>
                                <X className='h-6 w-6' aria-hidden='true' />
                            </button>
                        </div>
                        <div className='container mx-auto flow-root'>
                            <div className='divide-y divide-gray-500/10'>
                                <div className='space-y-2 py-6'>
                                    {navigation.map(item => (
                                        <Link
                                            onClick={() => setMobileMenuOpen(false)}
                                            key={item.name}
                                            href={item.href}
                                            className='block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-400/10'>
                                            {item.name}
                                        </Link>
                                    ))}
                                    {status === 'authenticated' ? (
                                        <Link
                                            onClick={() => setMobileMenuOpen(false)}
                                            href={clientRoutes.drive}
                                            className='block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-400/10'>
                                            Drive
                                        </Link>
                                    ) : (
                                        <Link
                                            onClick={() => setMobileMenuOpen(false)}
                                            href={clientRoutes.identity.login}
                                            className='block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-400/10'>
                                            Login
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Dialog.Panel>
                </Dialog>
            </div>
        </>
    );
}
