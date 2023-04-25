'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { Popover, Transition } from '@headlessui/react';
import clsx from 'clsx';

import { Logo } from '@/lib/components/logo';
import { clientRoutes } from '@/lib/data/routes';
import { useAuthStore } from '@/lib/stores/auth-store';
import { cn } from '@/lib/utils/cn';

// TODO: Remove Headless UI and migrate to Radix
export function Navbar() {
    const status = useAuthStore(state => state.status);
    const logout = useAuthStore(state => state.logout);

    return (
        <header className='fixed z-10 h-16 w-full shrink-0 bg-white/75 shadow backdrop-blur'>
            <div className='container mx-auto flex h-full items-center justify-between p-4'>
                <Link href='/' className='flex items-center gap-1.5 lg:gap-2'>
                    <Logo className='w-6' />
                    <span className='text-2xl font-medium'>Hushify</span>
                </Link>
                <ul className='flex items-center justify-center gap-4 md:gap-6'>
                    <li className='hidden lg:block'>
                        <Link
                            href={clientRoutes.blog.index}
                            className='text-lg duration-200 ease-out hover:text-brand-600'>
                            Blog
                        </Link>
                    </li>
                    <li className='hidden lg:block'>
                        <Link
                            href={clientRoutes.security}
                            className='text-lg duration-200 ease-out hover:text-brand-600'>
                            Security
                        </Link>
                    </li>
                    <li className='hidden lg:block'>
                        <Link
                            href={clientRoutes.about}
                            className='text-lg duration-200 ease-out hover:text-brand-600'>
                            About
                        </Link>
                    </li>
                    <li className='hidden lg:block'>
                        <Link
                            href={clientRoutes.legal}
                            className='text-lg duration-200 ease-out hover:text-brand-600'>
                            Legal
                        </Link>
                    </li>
                    {status === 'loading' && (
                        <li>
                            <span className='text-lg duration-200 ease-out hover:text-brand-600'>
                                Loading
                            </span>
                        </li>
                    )}
                    {status === 'unauthenticated' && (
                        <div className='flex items-center gap-2'>
                            <li className='hidden lg:block'>
                                <Link
                                    href={clientRoutes.identity.login}
                                    className={cn(
                                        'flex items-center justify-center rounded-lg px-4 py-1.5 font-medium',
                                        'bg-gray-600 text-white transition-colors hover:bg-gray-700'
                                    )}>
                                    Login
                                </Link>
                            </li>
                            <li className='hidden lg:block'>
                                <Link
                                    href={clientRoutes.identity.register}
                                    className={cn(
                                        'flex items-center justify-center rounded-lg px-4 py-1.5 font-medium',
                                        'bg-brand-600 text-white transition-colors hover:bg-brand-700'
                                    )}>
                                    Get Started
                                </Link>
                            </li>
                        </div>
                    )}
                    {status === 'authenticated' && (
                        <div className='flex items-center gap-2'>
                            <li className='hidden lg:block'>
                                <Link
                                    href={clientRoutes.drive}
                                    className={cn(
                                        'flex items-center justify-center rounded-lg px-4 py-1.5 font-medium',
                                        'bg-brand-600 text-white transition-colors hover:bg-brand-700'
                                    )}>
                                    Drive
                                </Link>
                            </li>
                            <li className='hidden lg:block'>
                                <button
                                    onClick={logout}
                                    className={cn(
                                        'flex items-center justify-center rounded-lg px-4 py-1.5 font-medium',
                                        'bg-gray-600 text-white transition-colors hover:bg-gray-700'
                                    )}>
                                    Logout
                                </button>
                            </li>
                        </div>
                    )}
                    <li className='lg:hidden'>
                        <MobileNavbar />
                    </li>
                </ul>
            </div>
        </header>
    );
}

function MobileNavbar() {
    const status = useAuthStore(state => state.status);
    const logout = useAuthStore(state => state.logout);

    return (
        <Popover>
            {({ open, close }) => (
                <>
                    <Popover.Button className='relative z-10 flex h-8 items-center justify-center gap-3 [&:not(:focus-visible)]:focus:outline-none'>
                        <span>Menu</span>
                        <svg
                            aria-hidden='true'
                            className='h-3.5 w-3.5 overflow-visible stroke-slate-700'
                            fill='none'
                            strokeWidth={2}
                            strokeLinecap='round'>
                            <path
                                d='M0 1H14M0 7H14M0 13H14'
                                className={clsx('origin-center transition', {
                                    'scale-90 opacity-0': open,
                                })}
                            />
                            <path
                                d='M2 2L12 12M12 2L2 12'
                                className={clsx('origin-center transition', {
                                    'scale-90 opacity-0': !open,
                                })}
                            />
                        </svg>
                    </Popover.Button>
                    <Transition.Root>
                        <Transition.Child
                            as={Fragment}
                            enter='duration-150 ease-out'
                            enterFrom='opacity-0'
                            enterTo='opacity-100'
                            leave='duration-150 ease-in'
                            leaveFrom='opacity-100'
                            leaveTo='opacity-0'>
                            <Popover.Overlay className='fixed inset-0 bg-slate-300/50' />
                        </Transition.Child>
                        <Transition.Child
                            as={Fragment}
                            enter='duration-150 ease-out'
                            enterFrom='opacity-0 scale-95'
                            enterTo='opacity-100 scale-100'
                            leave='duration-100 ease-in'
                            leaveFrom='opacity-100 scale-100'
                            leaveTo='opacity-0 scale-95'>
                            <Popover.Panel
                                as='ul'
                                className='absolute inset-x-0 top-full mx-4 mt-4 origin-top space-y-4 rounded-lg bg-gray-100 p-6 tracking-tight text-slate-950 shadow-xl ring-1 ring-slate-900/5'>
                                <li className='block w-full'>
                                    <Link
                                        onClick={close}
                                        href={clientRoutes.blog.index}
                                        className='text-lg duration-200 ease-out hover:text-brand-600'>
                                        Blog
                                    </Link>
                                </li>
                                <li className='block w-full'>
                                    <Link
                                        onClick={close}
                                        href={clientRoutes.security}
                                        className='text-lg duration-200 ease-out hover:text-brand-600'>
                                        Security
                                    </Link>
                                </li>
                                <li className='block w-full'>
                                    <Link
                                        onClick={close}
                                        href={clientRoutes.about}
                                        className='text-lg duration-200 ease-out hover:text-brand-600'>
                                        About
                                    </Link>
                                </li>
                                <li className='block w-full'>
                                    <Link
                                        onClick={close}
                                        href={clientRoutes.legal}
                                        className='text-lg duration-200 ease-out hover:text-brand-600'>
                                        Legal
                                    </Link>
                                </li>
                                {status === 'loading' && (
                                    <li className='block w-full'>
                                        <span className='text-lg duration-200 ease-out hover:text-brand-600'>
                                            Loading
                                        </span>
                                    </li>
                                )}
                                {status === 'unauthenticated' && (
                                    <>
                                        <li className='block w-full'>
                                            <Link
                                                onClick={close}
                                                href={clientRoutes.identity.login}
                                                className='text-lg duration-200 ease-out hover:text-brand-600'>
                                                Login
                                            </Link>
                                        </li>
                                        <li className='block w-full'>
                                            <Link
                                                onClick={close}
                                                href={clientRoutes.identity.register}
                                                className='text-lg duration-200 ease-out hover:text-brand-600'>
                                                Get Started
                                            </Link>
                                        </li>
                                    </>
                                )}
                                {status === 'authenticated' && (
                                    <>
                                        <li className='block w-full'>
                                            <Link
                                                onClick={close}
                                                href={clientRoutes.drive}
                                                className='text-lg duration-200 ease-out hover:text-brand-600'>
                                                My Drive
                                            </Link>
                                        </li>
                                        <li className='block w-full'>
                                            <button
                                                onClick={async () => {
                                                    await logout();
                                                    close();
                                                }}
                                                className='text-lg duration-200 ease-out hover:text-brand-600'>
                                                Logout
                                            </button>
                                        </li>
                                    </>
                                )}
                            </Popover.Panel>
                        </Transition.Child>
                    </Transition.Root>
                </>
            )}
        </Popover>
    );
}
