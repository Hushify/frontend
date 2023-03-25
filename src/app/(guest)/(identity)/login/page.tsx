import Link from 'next/link';

import { LoginForm } from '@/app/(guest)/(identity)/login/login-form';
import { clientRoutes } from '@/lib/data/routes';
import { cn } from '@/lib/utils/cn';

export const metadata = {
    title: 'Login',
    openGraph: {
        title: 'Login',
    },
    twitter: {
        title: 'Login',
    },
};

export default function Login() {
    return (
        <div className='w-full sm:max-w-[300px]'>
            <div className='space-y-1 text-center'>
                <h1 className='text-2xl font-bold'>Login</h1>
                <div className='text-sm text-slate-600'>
                    Forgot your password?{' '}
                    <Link
                        href={clientRoutes.identity.resetPassword}
                        className='text-brand-600 underline'>
                        Reset
                    </Link>
                </div>
            </div>

            <LoginForm />

            <div className='my-6 flex justify-center'>
                <hr className='w-1/2 border-gray-400' />
            </div>

            <div>
                <Link
                    type='button'
                    href={clientRoutes.identity.register}
                    className={cn(
                        'flex w-full items-center justify-center gap-2 rounded-lg py-1.5 font-medium',
                        'bg-gray-600 text-white focus-visible:ring-gray-600/75'
                    )}>
                    Register
                </Link>
            </div>
        </div>
    );
}
