import Link from 'next/link';

import { RegisterForm } from '@/app/(guest)/(identity)/register/register-form';
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
        <div className='flex w-full flex-col gap-6 sm:max-w-[300px]'>
            <div className='space-y-1 text-center'>
                <h1 className='text-2xl font-bold'>Sign Up</h1>
                <div className='text-sm text-gray-600'>
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

            <div className='max-w-[300px] space-y-2 text-center text-sm text-gray-600'>
                <div>By clicking continue, you agree to our:</div>
                <div>
                    <Link
                        href={clientRoutes.legal.terms}
                        className='text-brand-600 hover:underline'>
                        Terms of Service
                    </Link>
                    ,{' '}
                    <Link
                        href={clientRoutes.legal.privacy}
                        className='text-brand-600 hover:underline'>
                        Privacy Policy
                    </Link>
                    , and
                    <br />
                    <Link href={clientRoutes.legal.gdpr} className='text-brand-600 hover:underline'>
                        GDPR Policy
                    </Link>
                    .
                </div>
            </div>
        </div>
    );
}
