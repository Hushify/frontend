import { RegisterConfirmForm } from '@/app/(identity)/register/confirm/register-confirm-form';

export const metadata = {
    title: 'Register Confirmation',
    openGraph: {
        title: 'Register Confirmation',
    },
    twitter: {
        title: 'Register Confirmation',
    },
};

export default function Confirm() {
    return (
        <div className='w-full sm:max-w-[300px]'>
            <div className='space-y-1 text-center print:hidden'>
                <h1 className='text-2xl font-bold'>One last step</h1>
                <div className='text-sm text-slate-600'>
                    We just sent you a one time code on your email.
                </div>
            </div>
            <RegisterConfirmForm />
        </div>
    );
}
