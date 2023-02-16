'use client';

import { Logo } from '@/lib/components/logo';
import { clientRoutes } from '@/lib/data/routes';
import { getClaim } from '@/lib/services/auth';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Dialog, Transition } from '@headlessui/react';
import { useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import {
    Home,
    LogOut,
    Menu as MenuIcon,
    Search,
    Settings,
    Star,
    Trash,
    X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Fragment,
    ReactNode,
    SVGProps,
    useCallback,
    useMemo,
    useState,
} from 'react';

export interface Navigation {
    name: string;
    href: string;
    icon: (props: SVGProps<SVGSVGElement>) => JSX.Element;
}

export interface UserNavigation {
    name: string;
    href?: string;
    action?: () => void;
}

const navigation = [
    {
        href: clientRoutes.drive.index,
        name: 'Drive',
        icon: (props: any) => <Home {...props} />,
    },
    {
        href: '/starred',
        name: 'Starred',
        icon: (props: any) => <Star {...props} />,
    },
    {
        href: clientRoutes.drive.trash,
        name: 'Trash',
        icon: (props: any) => <Trash {...props} />,
    },
    {
        href: clientRoutes.settings,
        name: 'Settings',
        icon: (props: any) => <Settings {...props} />,
    },
];

export function AppShell({ children }: { children: ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarDesktopOpen, setSidebarDesktopOpen] = useState(true);
    const path = usePathname();

    const logoutFromAuthStore = useAuthStore(state => state.logout);
    const accessToken = useAuthStore(state => state.accessToken);
    const queryClient = useQueryClient();

    const logout = useCallback(async () => {
        queryClient.clear();
        await logoutFromAuthStore();
    }, [logoutFromAuthStore, queryClient]);

    const name = useMemo(() => {
        if (accessToken) {
            return getClaim(accessToken, 'name')!;
        }

        return '';
    }, [accessToken]);

    return (
        <div className='flex h-full flex-col'>
            <Transition.Root show={sidebarOpen} as={Fragment}>
                <Dialog
                    as='div'
                    className='fixed inset-0 z-40 flex md:hidden'
                    onClose={setSidebarOpen}>
                    <Transition.Child
                        as={Fragment}
                        enter='transition-opacity ease-linear duration-300'
                        enterFrom='opacity-0'
                        enterTo='opacity-100'
                        leave='transition-opacity ease-linear duration-300'
                        leaveFrom='opacity-100'
                        leaveTo='opacity-0'>
                        <Dialog.Overlay className='fixed inset-0 bg-gray-600 bg-opacity-75' />
                    </Transition.Child>
                    <Transition.Child
                        as={Fragment}
                        enter='transition ease-in-out duration-300 transform'
                        enterFrom='-translate-x-full'
                        enterTo='translate-x-0'
                        leave='transition ease-in-out duration-300 transform'
                        leaveFrom='translate-x-0'
                        leaveTo='-translate-x-full'>
                        <div className='relative flex w-full max-w-xs flex-1 flex-col bg-gray-800 pb-4'>
                            <Transition.Child
                                as={Fragment}
                                enter='ease-in-out duration-300'
                                enterFrom='opacity-0'
                                enterTo='opacity-100'
                                leave='ease-in-out duration-300'
                                leaveFrom='opacity-100'
                                leaveTo='opacity-0'>
                                <div className='absolute top-0 right-0 -mr-12 pt-2'>
                                    <button
                                        type='button'
                                        className='ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white'
                                        onClick={() => setSidebarOpen(false)}>
                                        <span className='sr-only'>
                                            Close sidebar
                                        </span>
                                        <X
                                            className='h-6 w-6 text-white'
                                            aria-hidden='true'
                                        />
                                    </button>
                                </div>
                            </Transition.Child>
                            <div className='flex h-16 flex-shrink-0 items-center space-x-3 bg-gray-900 px-4 text-white'>
                                <Logo height={32} width={32} />
                                <span className='text-xl font-semibold'>
                                    Hushify Drive
                                </span>
                            </div>
                            <div className='mt-5 h-0 flex-1 overflow-y-auto'>
                                <nav className='space-y-1 px-2'>
                                    {navigation.map(item => (
                                        <Link
                                            href={item.href}
                                            key={item.name}
                                            className={clsx(
                                                path?.startsWith(item.href)
                                                    ? 'bg-gray-900 text-white'
                                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                                                'group flex items-center rounded-md px-2 py-2 text-base font-medium'
                                            )}
                                            onClick={() =>
                                                setSidebarOpen(false)
                                            }>
                                            <item.icon
                                                className={clsx(
                                                    path?.startsWith(item.href)
                                                        ? 'text-gray-300'
                                                        : 'text-gray-400 group-hover:text-gray-300',
                                                    'mr-4 h-6 w-6 flex-shrink-0'
                                                )}
                                                aria-hidden='true'
                                            />
                                            {item.name}
                                        </Link>
                                    ))}
                                    <button
                                        type='button'
                                        className='group flex w-full items-center rounded-md px-2 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white'
                                        onClick={logout}>
                                        <LogOut
                                            size={20}
                                            className='mr-4 h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-gray-300'
                                            aria-hidden='true'
                                        />
                                        <span>Logout ({name})</span>
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </Transition.Child>
                    <div className='w-14 flex-shrink-0' aria-hidden='true'>
                        {/* Dummy element to force sidebar to shrink to fit close icon */}
                    </div>
                </Dialog>
            </Transition.Root>

            <div className='flex h-16 shrink-0 bg-gray-900 shadow'>
                <button
                    type='button'
                    className='px-4 text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-600 md:hidden'
                    onClick={() => setSidebarOpen(true)}>
                    <span className='sr-only'>Open sidebar</span>
                    <MenuIcon className='h-6 w-6' aria-hidden='true' />
                </button>
                <button
                    type='button'
                    className='hidden px-4 text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-600 md:inline-block'
                    onClick={() => setSidebarDesktopOpen(prev => !prev)}>
                    <span className='sr-only'>Toggle sidebar</span>
                    <MenuIcon className='h-6 w-6' aria-hidden='true' />
                </button>
                <div className='flex flex-1 justify-between'>
                    {/* Page Title */}
                    <div className='flex flex-1 items-center'>
                        <h1 className='text-xl font-semibold text-white md:text-2xl'>
                            Hushify Drive
                        </h1>
                    </div>
                    <div className='ml-4 flex items-center md:ml-6'>
                        <button
                            type='button'
                            className='cursor-pointer rounded-full bg-gray-800 p-1 text-white hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2'>
                            <span className='sr-only'>Search</span>
                            <Search size={24} aria-hidden='true' />
                        </button>
                    </div>
                </div>
            </div>

            <div className='flex h-full flex-auto'>
                <div className='hidden min-w-[256px] shrink-0 flex-col md:flex'>
                    <div className='flex flex-1 flex-col overflow-y-auto bg-gray-800'>
                        <nav className='flex-1 space-y-1 px-2 py-4'>
                            {navigation.map(item => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={clsx(
                                        path?.startsWith(item.href)
                                            ? 'bg-brand-600 text-white'
                                            : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                                        'group flex items-center rounded-md px-2 py-2 text-sm font-medium'
                                    )}>
                                    <item.icon
                                        className={clsx(
                                            path?.startsWith(item.href)
                                                ? 'text-gray-300'
                                                : 'text-gray-400 group-hover:text-gray-300',
                                            'mr-3 h-6 w-6 flex-shrink-0'
                                        )}
                                        aria-hidden='true'
                                    />
                                    {item.name}
                                </Link>
                            ))}
                            <button
                                type='button'
                                className='group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white'
                                onClick={logout}>
                                <LogOut
                                    className='mr-3 h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-gray-300'
                                    size={20}
                                />
                                <span>Logout</span>
                            </button>
                        </nav>
                    </div>
                </div>

                <main className='flex-auto'>{children}</main>
            </div>
        </div>
    );
}
