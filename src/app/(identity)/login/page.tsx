'use client';

import { InputWithLabel } from '@/lib/components/input-with-label';
import { apiRoutes, clientRoutes } from '@/lib/data/routes';
import { useFormMutation } from '@/lib/hooks/use-form-mutation';
import { initiateLogin } from '@/lib/services/auth';
import { useAuthStore } from '@/lib/stores/auth-store';
import { addServerErrors } from '@/lib/utils/addServerErrors';
import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader } from 'react-feather';
import { useForm } from 'react-hook-form';
import zod from 'zod';
import { shallow } from 'zustand/shallow';

type LoginFormInputs = {
    errors: string;
    email: string;
};

const loginSchema = zod
    .object({
        email: zod.string().email('Please check your email.'),
    })
    .required();

const Login = ({
    searchParams: _sp,
}: {
    searchParams?: { [key: string]: string | string[] | undefined };
}) => {
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<LoginFormInputs>({
        resolver: zodResolver(loginSchema),
    });

    const authState = useAuthStore(state => state, shallow);

    const { push } = useRouter();

    useEffect(() => {
        if (
            authState.masterKey &&
            authState.asymmetricEncPrivateKey &&
            authState.asymmetricEncPublicKey &&
            authState.signingPublicKey &&
            authState.signingPrivateKey &&
            authState.status === 'authenticated'
        ) {
            push(clientRoutes.drive.index);
        }
    }, [authState, push]);

    const onSubmit = async (data: LoginFormInputs) => {
        const result = await initiateLogin(
            apiRoutes.identity.initiateLogin,
            data.email
        );

        if (!result.success) {
            addServerErrors(result.errors, setError, Object.keys(data));
            return;
        }

        const params = new URLSearchParams({
            email: data.email,
        });

        push(`${clientRoutes.identity.loginConfirm}?${params.toString()}`);
    };

    const mutation = useFormMutation(onSubmit, setError, authState.logout);

    return (
        <motion.div
            className='w-full'
            initial={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}>
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

            <form
                className='mt-8 space-y-3'
                onSubmit={handleSubmit(data => mutation.mutateAsync(data))}>
                <small className='text-red-600'>{errors.errors?.message}</small>
                <InputWithLabel
                    error={errors.email}
                    id='email'
                    type='email'
                    placeholder='Enter your email'
                    autoComplete='email'
                    {...register('email')}>
                    Email
                </InputWithLabel>

                <button
                    type='submit'
                    disabled={mutation.isLoading}
                    className={clsx(
                        'flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg py-1.5 font-medium',
                        'disabled:cursor-not-allowed disabled:bg-opacity-80',
                        'bg-brand-600 text-white focus-visible:ring-brand-600/75'
                    )}>
                    <span>Continue</span>
                    <Loader
                        size={16}
                        className={clsx(
                            'animate-spin',
                            !mutation.isLoading && 'hidden'
                        )}
                    />
                </button>
            </form>

            <div className='my-6 flex justify-center'>
                <hr className='w-1/2 border-gray-400' />
            </div>

            <div>
                <button
                    onClick={() => push(clientRoutes.identity.register)}
                    type='button'
                    className={clsx(
                        'flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg py-1.5 font-medium',
                        'bg-gray-600 text-white focus-visible:ring-gray-600/75'
                    )}>
                    Register
                </button>
            </div>
        </motion.div>
    );
};

export default Login;
