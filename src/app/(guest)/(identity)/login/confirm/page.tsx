import { LoginConfirmForm } from '@/app/(guest)/(identity)/login/confirm/login-confirm-form';

export const metadata = {
    title: 'Login Confirmation',
    openGraph: {
        title: 'Login Confirmation',
    },
    twitter: {
        title: 'Login Confirmation',
    },
};

export default function Confirm() {
    return (
        <div className='w-full sm:max-w-[300px]'>
            <div className='space-y-1 text-center print:hidden'>
                <h1 className='text-2xl font-bold'>Enter Your Credentials</h1>
                <div className='text-sm text-gray-600'>
                    We just sent you a one time code on your email.
                </div>
            </div>

            <LoginConfirmForm />
        </div>
    );
}
