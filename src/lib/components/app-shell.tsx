'use client';

import {
    Fragment,
    HTMLAttributeAnchorTarget,
    ReactNode,
    useCallback,
    useMemo,
    useState,
} from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tooltip from '@radix-ui/react-tooltip';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    HardDrive,
    LogOut,
    LucideIcon,
    Mail,
    Menu,
    PieChart,
    Settings,
    Trash2,
    X,
} from 'lucide-react';

import { clientRoutes } from '@/lib/data/routes';
import { getClaim } from '@/lib/services/auth';
import { stats } from '@/lib/services/drive';
// import { stats } from '@/lib/services/drive';
import { useAuthStore } from '@/lib/stores/auth-store';
import { usePrefStore } from '@/lib/stores/pref-store';
import { cn } from '@/lib/utils/cn';
import { humanFileSize } from '@/lib/utils/humanized-file-size';

export type Navigation = {
    href: string;
    name: string;
    icon: LucideIcon;
    target?: HTMLAttributeAnchorTarget;
    rel?: string;
};

const navigation: Navigation[] = [
    {
        href: clientRoutes.drive,
        name: 'Drive',
        icon: HardDrive,
    },
    {
        href: clientRoutes.trash,
        name: 'Trash',
        icon: Trash2,
    },
    {
        href: clientRoutes.settings,
        name: 'Settings',
        icon: Settings,
    },
    {
        href: 'mailto:feedback@hushify.io',
        name: 'Feedback',
        icon: Mail,
        target: '_blank',
        rel: 'noreferrer',
    },
];

export function AppShell({ children }: { children: ReactNode }) {
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const sidebarOpen = usePrefStore(state => state.sidebarOpen);
    const setSidebarOpen = usePrefStore(state => state.setSidebarOpen);
    const path = usePathname();

    const logoutFromAuthStore = useAuthStore(state => state.logout);
    const accessToken = useAuthStore(state => state.accessToken);
    const queryClient = useQueryClient();

    const { data } = useQuery(['stats'], async () => await stats(accessToken!));

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
            <div className='flex h-16 shrink-0 border-b bg-white shadow'>
                <Dialog.Root open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
                    <Dialog.Trigger asChild>
                        <button
                            type='button'
                            className='px-4 text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-600 md:hidden'
                            onClick={() => setMobileSidebarOpen(true)}>
                            <span className='sr-only'>Open sidebar</span>
                            <Menu className='h-5 w-5 shrink-0' aria-hidden='true' />
                        </button>
                    </Dialog.Trigger>

                    <Dialog.Portal>
                        <Dialog.Overlay className='fixed inset-0 bg-gray-600/75 data-[state=open]:animate-overlayShow md:hidden' />
                        <Dialog.Content className='fixed inset-0 flex w-full max-w-xs data-[state=open]:animate-sidebarContentShow md:hidden'>
                            <div className='flex flex-1 flex-col bg-white'>
                                <div className='flex h-16 shrink-0 items-center justify-between gap-3 px-4'>
                                    <Dialog.Title className='text-lg font-semibold'>
                                        Menu
                                    </Dialog.Title>
                                    <Dialog.Close asChild>
                                        <button
                                            type='button'
                                            className='rounded-full border border-gray-600 p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-600'
                                            onClick={() => setMobileSidebarOpen(false)}>
                                            <span className='sr-only'>Close sidebar</span>
                                            <X className='h-5 w-5' aria-hidden='true' />
                                        </button>
                                    </Dialog.Close>
                                </div>
                                <div className='flex h-0 flex-1 flex-col justify-between overflow-y-auto'>
                                    <nav className='space-y-1'>
                                        {navigation.map(item => (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                target={item.target}
                                                rel={item.rel}
                                                className={cn(
                                                    path?.startsWith(item.href)
                                                        ? 'border-l-4 border-brand-600 bg-brand-50 text-brand-600'
                                                        : 'text-gray-600 hover:bg-brand-100 hover:text-brand-600',
                                                    'flex items-center gap-2 px-3 py-2 text-sm font-semibold'
                                                )}
                                                onClick={() => setMobileSidebarOpen(false)}>
                                                <item.icon
                                                    className='h-5 w-5 shrink-0'
                                                    aria-hidden='true'
                                                />
                                                {item.name}
                                            </Link>
                                        ))}
                                        <button
                                            type='button'
                                            className='flex w-full items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-brand-100 hover:text-brand-600'
                                            onClick={logout}>
                                            <LogOut
                                                className='h-5 w-5 shrink-0'
                                                aria-hidden='true'
                                            />
                                            <span>Logout</span>
                                        </button>
                                        {data?.success ? (
                                            <div className='flex w-full items-center gap-2 px-3 py-2 text-center text-sm font-semibold text-gray-600'>
                                                <PieChart
                                                    className='h-5 w-5 shrink-0'
                                                    aria-hidden='true'
                                                />
                                                <span>
                                                    {humanFileSize(data.data.used, false, 0)} /{' '}
                                                    {humanFileSize(data.data.total, false, 0)} (
                                                    {(
                                                        (data.data.used * 100) /
                                                        data.data.total
                                                    ).toFixed(2)}
                                                    %)
                                                </span>
                                            </div>
                                        ) : null}
                                    </nav>
                                    <div className='break-all bg-brand-600 px-3 py-2 font-semibold text-white'>
                                        {name}
                                    </div>
                                </div>
                            </div>

                            {/* Dummy element to force sidebar to shrink to fit close icon */}
                            <Dialog.Close asChild>
                                <div className='w-14 shrink-0' aria-hidden='true' />
                            </Dialog.Close>
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>
                <button
                    type='button'
                    className='hidden px-4 text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-600 md:inline-block'
                    onClick={() => setSidebarOpen(!sidebarOpen)}>
                    <span className='sr-only'>Toggle sidebar</span>
                    <Menu className='h-5 w-5 shrink-0' aria-hidden='true' />
                </button>
                <div className='flex flex-1 items-center justify-between pr-4'>
                    <h1 className='flex items-center gap-1 text-lg font-semibold text-gray-800 md:text-2xl'>
                        <span>Hushify Drive</span>
                        <span className='rounded bg-brand-600 py-px px-1 text-xs text-white md:text-sm'>
                            Beta
                        </span>
                    </h1>
                    <div className='hidden md:block'>{name}</div>
                </div>
            </div>

            <div className='flex h-full flex-auto'>
                <div className='hidden shrink-0 flex-col overflow-y-auto border-r bg-white md:flex'>
                    <nav
                        className={cn('flex flex-1 flex-col items-center gap-1', {
                            'min-w-[16rem]': sidebarOpen,
                        })}>
                        {navigation.map(item => {
                            const LinkComp = (
                                <Link
                                    href={item.href}
                                    target={item.target}
                                    rel={item.rel}
                                    className={cn(
                                        path?.startsWith(item.href)
                                            ? 'bg-brand-50 text-brand-600'
                                            : 'text-gray-600 hover:bg-brand-100 hover:text-brand-600',
                                        'flex w-full items-center gap-2 p-3 text-sm font-semibold'
                                    )}>
                                    <item.icon className='h-5 w-5 shrink-0' aria-hidden='true' />
                                    <span
                                        className={cn({
                                            'sr-only': !sidebarOpen,
                                        })}>
                                        {item.name}
                                    </span>
                                </Link>
                            );

                            return sidebarOpen ? (
                                <Fragment key={item.name}>{LinkComp}</Fragment>
                            ) : (
                                <Tooltip.Root key={item.name}>
                                    <Tooltip.Trigger asChild>{LinkComp}</Tooltip.Trigger>
                                    <Tooltip.Portal>
                                        <Tooltip.Content
                                            side='right'
                                            className='select-none rounded-[4px] bg-brand-600 px-[15px] py-[10px] text-[15px] leading-none text-white shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] will-change-[transform,opacity] data-[state=delayed-open]:data-[side=top]:animate-slideDownAndFade data-[state=delayed-open]:data-[side=right]:animate-slideLeftAndFade data-[state=delayed-open]:data-[side=left]:animate-slideRightAndFade data-[state=delayed-open]:data-[side=bottom]:animate-slideUpAndFade'
                                            sideOffset={5}>
                                            {item.name}
                                            <Tooltip.Arrow className='fill-brand-600' />
                                        </Tooltip.Content>
                                    </Tooltip.Portal>
                                </Tooltip.Root>
                            );
                        })}

                        {sidebarOpen ? (
                            <button
                                type='button'
                                className='flex w-full items-center gap-2 p-3 text-sm font-semibold text-gray-600 hover:bg-brand-100 hover:text-brand-600'
                                onClick={logout}>
                                <LogOut className='h-5 w-5 shrink-0' aria-hidden='true' />
                                <span>Logout</span>
                            </button>
                        ) : (
                            <Tooltip.Root>
                                <Tooltip.Trigger asChild>
                                    <button
                                        type='button'
                                        className='flex w-full items-center gap-2 p-3 text-sm font-semibold text-gray-600 hover:bg-brand-100 hover:text-brand-600'
                                        onClick={logout}>
                                        <LogOut className='h-5 w-5 shrink-0' aria-hidden='true' />
                                        <span className='sr-only'>Logout</span>
                                    </button>
                                </Tooltip.Trigger>
                                <Tooltip.Portal>
                                    <Tooltip.Content
                                        side='right'
                                        className='select-none rounded-[4px] bg-brand-600 px-[15px] py-[10px] text-[15px] leading-none text-white shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] will-change-[transform,opacity] data-[state=delayed-open]:data-[side=top]:animate-slideDownAndFade data-[state=delayed-open]:data-[side=right]:animate-slideLeftAndFade data-[state=delayed-open]:data-[side=left]:animate-slideRightAndFade data-[state=delayed-open]:data-[side=bottom]:animate-slideUpAndFade'
                                        sideOffset={5}>
                                        Logout
                                        <Tooltip.Arrow className='fill-brand-600' />
                                    </Tooltip.Content>
                                </Tooltip.Portal>
                            </Tooltip.Root>
                        )}

                        {data?.success && sidebarOpen ? (
                            <div className='mt-auto p-2 text-center text-sm'>
                                {humanFileSize(data.data.used, false, 0)} /{' '}
                                {humanFileSize(data.data.total, false, 0)} (
                                {((data.data.used * 100) / data.data.total).toFixed(2)}
                                %)
                            </div>
                        ) : null}
                    </nav>
                </div>

                <main className='flex-auto bg-white'>{children}</main>
            </div>
        </div>
    );
}
