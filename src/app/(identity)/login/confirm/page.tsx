'use client';

import { InputWithLabel } from '@/lib/components/input-with-label';
import { apiRoutes, clientRoutes } from '@/lib/data/routes';
import { useFormMutation } from '@/lib/hooks/use-form-mutation';
import { authenticate, initiateLogin } from '@/lib/services/auth';
import { CryptoService } from '@/lib/services/crypto.worker';
import { useAuthStore } from '@/lib/stores/auth-store';
import { addServerErrors } from '@/lib/utils/addServerErrors';
import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import { wrap } from 'comlink';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader } from 'react-feather';
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
    const searchParams = useSearchParams();

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
    const setAccessToken = useAuthStore(state => state.setAccessToken);
    const setMasterKey = useAuthStore(state => state.setMasterKey);
    const setAsymmetricEncKeyPair = useAuthStore(
        state => state.setAsymmetricEncKeyPair
    );
    const setSigningKeyPair = useAuthStore(state => state.setSigningKeyPair);
    const setStatus = useAuthStore(state => state.setStatus);

    const [resendTimer, setResendTimer] = useState(30);

    useEffect(() => {
        const interval = setInterval(() => {
            if (resendTimer >= 30) {
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
        const result = await initiateLogin(
            apiRoutes.identity.initiateLogin,
            searchParams.get('email') as string
        );

        if (!result.success) {
            addServerErrors(result.errors, setError, ['errors', 'email']);
            return;
        }

        setResendTimer(30);
    };

    const resendMutation = useFormMutation(resendCode, undefined, error => {
        const message = error
            ? (error as Error).message
            : 'Something went wrong!';
        addServerErrors(
            { errors: [message] },
            setError,
            Object.keys({ errors: undefined })
        );
    });

    const onSubmit = async (data: ConfirmFormInputs) => {
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
            new URL('@/lib/services/crypto.worker', import.meta.url),
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
        setSigningKeyPair(result.data.signingPublicKey, keys.signingPrivateKey);
        setAccessToken(accessToken);

        push(clientRoutes.drive.index);
    };

    const mutation = useFormMutation(onSubmit, setError);

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
            <form
                className='mt-8 space-y-3'
                onSubmit={handleSubmit(data => mutation.mutateAsync(data))}>
                <small className='text-red-600'>{errors.errors?.message}</small>
                <InputWithLabel
                    error={errors.email}
                    type='email'
                    id='email'
                    autoComplete='email'
                    {...register('email')}>
                    Email
                </InputWithLabel>
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
                <InputWithLabel
                    error={errors.code}
                    type='text'
                    id='code'
                    placeholder='Enter the code'
                    autoComplete='off'
                    minLength={6}
                    {...register('code')}>
                    <span>Code</span>
                    <div className='flex items-center justify-center gap-1'>
                        {resendTimer <= 0 ? (
                            <button
                                disabled={
                                    resendMutation.isLoading ||
                                    mutation.isLoading
                                }
                                type='button'
                                onClick={resendMutation.mutateAsync}
                                className='underline disabled:cursor-not-allowed disabled:no-underline'>
                                Resend
                            </button>
                        ) : (
                            <span>Resend in {resendTimer}</span>
                        )}
                        {resendMutation.isLoading && (
                            <Loader size={16} className='animate-spin' />
                        )}
                    </div>
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
        </motion.div>
    );
};

export default Confirm;
