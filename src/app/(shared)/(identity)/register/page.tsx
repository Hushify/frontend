import Link from 'next/link';

import { RegisterForm } from '@/app/(shared)/(identity)/register/register-form';
import { clientRoutes } from '@/lib/data/routes';

export const metadata = {
    title: 'Register',
    openGraph: {
        title: 'Register',
    },
    twitter: {
        title: 'Register',
    },
};

export default function RegisterPage() {
    return (
        <div className='flex w-full flex-col gap-4 sm:max-w-[300px]'>
            <div className='space-y-1 text-center'>
                <h1 className='text-2xl font-bold'>Sign Up</h1>
                <div className='text-sm text-slate-600'>
                    Already have an account?{' '}
                    <Link href={clientRoutes.identity.login} className='text-brand-600 underline'>
                        Login
                    </Link>
                </div>
            </div>

            <RegisterForm />

            <div className='flex justify-center'>
                <hr className='w-1/2 border-gray-400' />
            </div>

            <div className='mx-auto max-w-[300px] text-center text-sm text-gray-600'>
                By clicking continue, you agree to our{' '}
                <Link href={clientRoutes.terms} className='text-brand-600 underline'>
                    Terms of Service
                </Link>{' '}
                and{' '}
                <Link href={clientRoutes.privacy} className='text-brand-600 underline'>
                    Privacy Policy
                </Link>
                .
            </div>
        </div>
    );
}
