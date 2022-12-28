'use client';

import { apiRoutes, clientRoutes } from '@/data/routes';
import { authenticate, initiateLogin } from '@/services/auth';
import { CryptoService } from '@/services/crypto.worker';
import { useAuthStore } from '@/stores/auth-store';
import { addServerErrors } from '@/utils/addServerErrors';
import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import { wrap } from 'comlink';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import zod from 'zod';

type ConfirmFormInputs = {
    errors: string;
    code: string;
    email: string;
    password: string;
};

const confirmSchema = zod
    .object({
        email: zod.string().email(),
        code: zod.string(),
        password: zod.string().min(10).max(64),
    })
    .required();

const Confirm = () => {
    const { push } = useRouter();

    const [isDisabled, setIsDisabled] = useState(false);
    const searchParams = useSearchParams();

    useEffect(() => {
        setIsDisabled(!searchParams.has('email'));
    }, [searchParams]);

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<ConfirmFormInputs>({
        resolver: zodResolver(confirmSchema),
        defaultValues: {
            email: searchParams.get('email') ?? undefined,
        },
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const setAccessToken = useAuthStore(state => state.setAccessToken);
    const setMasterKey = useAuthStore(state => state.setMasterKey);
    const setAsymmetricEncKeyPair = useAuthStore(
        state => state.setAsymmetricEncKeyPair
    );
    const setSigningKeyPair = useAuthStore(state => state.setSigningKeyPair);
    const setStatus = useAuthStore(state => state.setStatus);

    const [resendTimer, setResendTimer] = useState(60);
    const [resending, setResending] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            if (resendTimer >= 60) {
                clearInterval(interval);
            }
            setResendTimer(prev => {
                if (resendTimer <= 0) {
                    clearInterval(interval);
                    return 0;
                }

                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [resendTimer]);

    const resendCode = async () => {
        try {
            setResending(true);
            setIsSubmitting(true);
            const result = await initiateLogin(
                apiRoutes.identity.initiateLogin,
                searchParams.get('email') as string
            );

            if (!result.success) {
                addServerErrors(result.errors, setError, ['errors', 'email']);
                return;
            }

            setResendTimer(60);
        } catch (error) {
            const message = error
                ? (error as Error).message
                : 'Something went wrong!';
            addServerErrors({ errors: [message] }, setError, [
                'errors',
                'email',
            ]);
        } finally {
            setIsSubmitting(false);
            setResending(false);
        }
    };

    const onSubmit = async (data: ConfirmFormInputs) => {
        try {
            setIsSubmitting(true);

            const result = await authenticate<ConfirmFormInputs>(
                apiRoutes.identity.login,
                data.email,
                data.code
            );

            if (!result.success) {
                addServerErrors(result.errors, setError, Object.keys(data));
                return;
            }

            const worker = new Worker(
                new URL('@/services/crypto.worker', import.meta.url),
                {
                    type: 'module',
                    name: 'hushify-crypto-worker',
                }
            );

            const crypto = wrap<typeof CryptoService>(worker);

            const keys = await crypto.decryptRequiredKeys(
                data.password,
                result.data.salt,
                result.data.masterKeyNonce,
                result.data.encMasterKey,
                result.data.asymmetricEncKeyNonce,
                result.data.encAsymmetricPrivateKey,
                result.data.signingKeyNonce,
                result.data.encSigningPrivateKey
            );

            const accessToken = await crypto.decryptAccessToken(
                result.data.encAccessToken,
                result.data.encAccessTokenNonce,
                result.data.serverPublicKey,
                keys.asymmetricPrivateKey
            );

            setStatus('authenticated');
            setMasterKey(keys.masterKey);
            setAsymmetricEncKeyPair(
                result.data.asymmetricEncPublicKey,
                keys.asymmetricPrivateKey
            );
            setSigningKeyPair(
                result.data.signingPublicKey,
                keys.signingPrivateKey
            );
            setAccessToken(accessToken);

            push(clientRoutes.drive.index);
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
        <motion.div
            className='w-full'
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}>
            {/* eslint-disable-next-line react/no-unknown-property */}
            <style jsx global>
                {`
                    @media print {
                        html,
                        body {
                            overflow: hidden;
                        }
                    }
                `}
            </style>
            <div className='space-y-1 text-center print:hidden'>
                <h1 className='text-2xl font-bold'>Enter Your Credentials</h1>
                <div className='text-sm text-slate-600'>
                    We just sent you a one time code on your email.
                </div>
            </div>
            <form className='mt-8 space-y-3' onSubmit={handleSubmit(onSubmit)}>
                <small className='text-red-600'>{errors.errors?.message}</small>
                <div className='flex flex-col gap-1'>
                    <label
                        htmlFor='email'
                        className='flex items-center justify-between text-sm tracking-wide'>
                        Email
                    </label>
                    <input
                        readOnly
                        type='email'
                        id='email'
                        className='h-9 bg-gray-200'
                        {...register('email')}
                    />
                    <small className='text-red-600'>
                        {errors.email?.message}
                    </small>
                </div>
                <div className='flex flex-col gap-1'>
                    <label
                        htmlFor='password'
                        className='flex items-center justify-between text-sm tracking-wide'>
                        <span>Password</span>
                        <button
                            onClick={() => setShowPassword(prev => !prev)}
                            type='button'
                            className='underline'>
                            {showPassword ? 'Hide' : 'Show'}
                        </button>
                    </label>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        id='password'
                        placeholder='Password'
                        autoComplete='current-password'
                        minLength={10}
                        maxLength={64}
                        className={clsx(
                            'h-9 bg-transparent placeholder:text-slate-400',
                            !!errors.password && 'border-red-600'
                        )}
                        {...register('password')}
                    />
                    {errors.password?.type === 'zxcvbn' ? (
                        errors.password?.message?.split('\\n').map(e => (
                            <small key={e} className='text-red-600'>
                                {e}
                            </small>
                        ))
                    ) : (
                        <small className='text-red-600'>
                            {errors.password?.message}
                        </small>
                    )}
                </div>
                <div className='flex flex-col gap-1'>
                    <label
                        htmlFor='code'
                        className='flex items-center justify-between text-sm tracking-wide'>
                        <span>Code</span>
                        <div className='flex items-center justify-center gap-1'>
                            {resendTimer <= 0 ? (
                                <button
                                    disabled={resending || isSubmitting}
                                    type='button'
                                    onClick={resendCode}
                                    className='underline disabled:cursor-not-allowed disabled:no-underline'>
                                    Resend
                                </button>
                            ) : (
                                <span>Resend in {resendTimer}</span>
                            )}
                            {resending && (
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    viewBox='0 0 24 24'
                                    fill='none'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    className='h-4 w-4 animate-spin'>
                                    <line x1='12' y1='2' x2='12' y2='6' />
                                    <line x1='12' y1='18' x2='12' y2='22' />
                                    <line
                                        x1='4.93'
                                        y1='4.93'
                                        x2='7.76'
                                        y2='7.76'
                                    />
                                    <line
                                        x1='16.24'
                                        y1='16.24'
                                        x2='19.07'
                                        y2='19.07'
                                    />
                                    <line x1='2' y1='12' x2='6' y2='12' />
                                    <line x1='18' y1='12' x2='22' y2='12' />
                                    <line
                                        x1='4.93'
                                        y1='19.07'
                                        x2='7.76'
                                        y2='16.24'
                                    />
                                    <line
                                        x1='16.24'
                                        y1='7.76'
                                        x2='19.07'
                                        y2='4.93'
                                    />
                                </svg>
                            )}
                        </div>
                    </label>
                    <input
                        type='text'
                        id='code'
                        placeholder='Enter the code'
                        autoComplete='off'
                        minLength={6}
                        className={clsx(
                            'h-9 bg-transparent placeholder:text-slate-400',
                            !!errors.code && 'border-red-600'
                        )}
                        {...register('code')}
                    />
                    <small className='text-red-600'>
                        {errors.code?.message}
                    </small>
                </div>
                <button
                    type='submit'
                    disabled={isSubmitting || isDisabled}
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
        </motion.div>
    );
};

export default Confirm;
