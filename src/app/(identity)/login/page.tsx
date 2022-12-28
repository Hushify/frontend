'use client';

import { apiRoutes, clientRoutes } from '@/data/routes';
import { initiateLogin, refreshToken } from '@/services/auth';
import { CryptoService } from '@/services/crypto.worker';
import { useAuthStore } from '@/stores/auth-store';
import { addServerErrors } from '@/utils/addServerErrors';
import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import { wrap } from 'comlink';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import zod from 'zod';
import shallow from 'zustand/shallow';

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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const authState = useAuthStore(state => state, shallow);

    useEffect(() => {
        document.title = 'Login';
    }, []);

    const { push } = useRouter();

    useEffect(() => {
        const abortController = new AbortController();

        if (
            authState.accessToken &&
            authState.masterKey &&
            authState.status === 'authenticated'
        ) {
            push(clientRoutes.drive.index);
            return () => abortController.abort();
        }

        if (
            authState.masterKey &&
            authState.asymmetricEncPrivateKey &&
            authState.asymmetricEncPublicKey &&
            authState.signingPublicKey &&
            authState.signingPrivateKey &&
            authState.status === 'authenticated'
        ) {
            const tryRefreshSession = async () => {
                try {
                    const result = await refreshToken(
                        apiRoutes.identity.refresh
                    );

                    if (abortController.signal.aborted) {
                        return;
                    }

                    if (result.success) {
                        const worker = new Worker(
                            new URL(
                                '@/services/crypto.worker',
                                import.meta.url
                            ),
                            {
                                type: 'module',
                                name: 'hushify-crypto-worker',
                            }
                        );
                        const cryptoWorker = wrap<typeof CryptoService>(worker);
                        authState.setAccessToken(
                            await cryptoWorker.decryptAccessToken(
                                result.data.encAccessToken,
                                result.data.accessTokenNonce,
                                result.data.serverPublicKey,
                                authState.asymmetricEncPrivateKey!
                            )
                        );
                        authState.setStatus('authenticated');
                    } else {
                        authState.setStatus('unauthenticated');
                        authState.setMasterKey(undefined);
                    }
                } catch {
                    if (!abortController.signal.aborted) {
                        authState.setStatus('unauthenticated');
                        authState.setMasterKey(undefined);
                    }
                }
            };

            tryRefreshSession();

            return () => abortController.abort();
        }

        return () => abortController.abort();
    }, [
        authState,
        authState.accessToken,
        authState.masterKey,
        authState.status,
        push,
    ]);

    const onSubmit = async (data: LoginFormInputs) => {
        try {
            setIsSubmitting(true);
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
        } catch (error) {
            await authState.logout();
            const message = error
                ? (error as Error).message
                : 'Something went wrong!';
            addServerErrors({ errors: [message] }, setError, Object.keys(data));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            className='w-full'
            initial={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}>
            <div className='space-y-1 text-center'>
                <h1 className='text-2xl font-bold'>Login</h1>
                <div className='text-sm text-slate-600'>
                    Don&apos;t have an account?{' '}
                    <Link
                        href={clientRoutes.identity.register}
                        className='text-brand underline'>
                        Register
                    </Link>
                </div>
            </div>

            <form className='mt-8 space-y-3' onSubmit={handleSubmit(onSubmit)}>
                <small className='text-red-600'>{errors.errors?.message}</small>
                <div className='flex flex-col gap-1'>
                    <label htmlFor='email' className='text-sm tracking-wide'>
                        Email
                    </label>
                    <input
                        type='email'
                        id='email'
                        placeholder='Enter your email'
                        autoComplete='email'
                        className={clsx(
                            'h-9 bg-transparent placeholder:text-slate-400',
                            !!errors.email && 'border-red-600'
                        )}
                        {...register('email')}
                    />
                    <small className='text-red-600'>
                        {errors.email?.message}
                    </small>
                </div>
                <button
                    type='submit'
                    disabled={isSubmitting}
                    className={clsx(
                        'flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-600 py-1.5 font-medium text-white',
                        'disabled:cursor-not-allowed disabled:bg-opacity-80'
                    )}>
                    <span>Login</span>
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

            <div className='my-6 flex justify-center'>
                <hr className='w-1/2 border-gray-400' />
            </div>

            <div>
                <button
                    onClick={() => push(clientRoutes.identity.forgotPassword)}
                    type='button'
                    className='flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-gray-600 py-1.5 font-medium text-white'>
                    Forgot Password?
                </button>
            </div>
        </motion.div>
    );
};

export default Login;
