'use client';

import { apiRoutes, clientRoutes } from '@/data/routes';
import { registerOrForgotPassword } from '@/services/auth';
import { addServerErrors } from '@/utils/addServerErrors';
import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import zod from 'zod';

type ResendEmailConfirmationFormInputs = {
    errors: string;
    email: string;
};

const resendEmailConfirmationSchema = zod
    .object({
        email: zod.string().email('Please check your email.'),
    })
    .required();

const ResendEmailConfirmation = () => {
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<ResendEmailConfirmationFormInputs>({
        resolver: zodResolver(resendEmailConfirmationSchema),
    });
    const { push } = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmit = async (data: ResendEmailConfirmationFormInputs) => {
        try {
            setIsSubmitting(true);
            const result =
                await registerOrForgotPassword<ResendEmailConfirmationFormInputs>(
                    apiRoutes.identity.resendConfirmation,
                    data.email
                );

            if (!result.success) {
                addServerErrors(result.errors, setError, Object.keys(data));
                return;
            }

            const params = new URLSearchParams({
                email: data.email,
            });

            push(
                `${clientRoutes.identity.registerConfirm}?${params.toString()}`
            );
        } catch (error) {
            const message = error
                ? (error as Error).message
                : 'Something went wrong!';
            addServerErrors({ errors: [message] }, setError, Object.keys(data));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className='w-full'>
            <div className='space-y-1 text-center'>
                <h1 className='text-2xl font-bold'>Resend Code</h1>
            </div>
            <form
                className='mt-8 w-full space-y-3'
                onSubmit={handleSubmit(onSubmit)}>
                {errors.errors?.message && (
                    <small className='text-red-600'>
                        {errors.errors?.message}
                    </small>
                )}
                <div className='w-full'>
                    <label htmlFor='email' className='sr-only'>
                        Email
                    </label>
                    <input
                        type='email'
                        id='email'
                        placeholder='Enter your email'
                        autoComplete='email'
                        className='h-9 bg-transparent placeholder:text-slate-400'
                        {...register('email')}
                    />
                    {errors.email?.message && (
                        <small className='text-red-600'>
                            {errors.email?.message}
                        </small>
                    )}
                </div>
                <button
                    type='submit'
                    disabled={isSubmitting}
                    className={clsx(
                        'flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-600 py-1.5 font-medium text-white',
                        'disabled:cursor-not-allowed disabled:bg-opacity-80'
                    )}>
                    <span>Continue</span>
                    <svg
                        xmlns='http://www.w3.org/2000/svg'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        className={clsx(
                            'h-4 w-4 animate-spin',
                            !isSubmitting && 'hidden'
                        )}>
                        <line x1='12' y1='2' x2='12' y2='6' />
                        <line x1='12' y1='18' x2='12' y2='22' />
                        <line x1='4.93' y1='4.93' x2='7.76' y2='7.76' />
                        <line x1='16.24' y1='16.24' x2='19.07' y2='19.07' />
                        <line x1='2' y1='12' x2='6' y2='12' />
                        <line x1='18' y1='12' x2='22' y2='12' />
                        <line x1='4.93' y1='19.07' x2='7.76' y2='16.24' />
                        <line x1='16.24' y1='7.76' x2='19.07' y2='4.93' />
                    </svg>
                </button>
            </form>
        </div>
    );
};

export default ResendEmailConfirmation;
