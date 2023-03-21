'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Loader } from 'lucide-react';
import { useForm } from 'react-hook-form';
import zod from 'zod';

import { InputWithLabel } from '@/lib/components/input-with-label';
import { clientRoutes } from '@/lib/data/routes';
import { initiateLogin, login } from '@/lib/services/auth';
import CryptoWorker from '@/lib/services/comlink-crypto';
import { useAuthStore } from '@/lib/stores/auth-store';
import { addServerErrors } from '@/lib/utils/add-server-errors';
import { cn } from '@/lib/utils/cn';

type ConfirmFormInputs = {
    errors: string;
    code: string;
    email: string;
    password: string;
};

const confirmSchema = zod
    .object({
        email: zod.string().email(),
        code: zod.string().length(6, 'Code must be exactly 6 characters.'),
        password: zod
            .string()
            .min(10, 'Password must be at least 10 characters long.')
            .max(64, 'Password can not exceed 64 characters.'),
    })
    .required();

export function LoginConfirmForm() {
    const { push } = useRouter();
    const setData = useAuthStore(state => state.setData);
    const email = useAuthStore(state => state.email);

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<ConfirmFormInputs>({
        resolver: zodResolver(confirmSchema),
        defaultValues: {
            email: email ?? undefined,
        },
    });
    const [showPassword, setShowPassword] = useState(false);

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

    const resendMutation = useMutation(
        async () => {
            const result = await initiateLogin(email!);

            if (!result.success) {
                addServerErrors(result.errors, setError, ['errors', 'email']);
                return null;
            }

            setResendTimer(30);
            return null;
        },
        {
            onError: error => {
                const message = error ? (error as Error).message : 'Something went wrong!';
                setError('errors', { message });
            },
        }
    );

    const mutation = useMutation(
        async (data: ConfirmFormInputs) => {
            const result = await login<ConfirmFormInputs>(data.email, data.code);

            if (!result.success) {
                addServerErrors(result.errors, setError, Object.keys(data));
                return null;
            }

            const crypto = CryptoWorker.instance;

            try {
                const keys = await crypto.decryptRequiredKeys(
                    data.password,
                    result.data.cryptoProperties
                );

                const accessToken = await crypto.asymmetricDecrypt(
                    result.data.encryptedAccessToken,
                    result.data.accessTokenNonce,
                    result.data.serverPublicKey,
                    keys.asymmetricPrivateKey
                );

                setData({
                    status: 'authenticated',
                    masterKey: keys.masterKey,
                    publicKey: result.data.cryptoProperties.asymmetricKeyBundle.publicKey,
                    privateKey: keys.asymmetricPrivateKey,
                    signingPublicKey: result.data.cryptoProperties.signingKeyBundle.publicKey,
                    signingPrivateKey: keys.signingPrivateKey,
                    accessToken,
                });

                push(clientRoutes.drive);
            } catch (error) {
                setError('errors', { message: 'Wrong password.' });
            }
        },
        {
            onError: error => {
                const message = error ? (error as Error).message : 'Something went wrong!';
                setError('errors', { message });
            },
        }
    );

    return (
        <form
            className='mt-8 space-y-3'
            onSubmit={handleSubmit(data => mutation.mutateAsync(data))}>
            <small className='text-red-600'>{errors.errors?.message}</small>
            <InputWithLabel
                error={errors.email}
                type='email'
                id='email'
                placeholder='Enter your email'
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
                    className={cn(
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
                    <small className='text-red-600'>{errors.password?.message}</small>
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
                            disabled={resendMutation.isLoading || mutation.isLoading}
                            type='button'
                            onClick={async () => await resendMutation.mutateAsync()}
                            className='underline disabled:cursor-not-allowed disabled:no-underline'>
                            Resend
                        </button>
                    ) : (
                        <span>Resend in {resendTimer}</span>
                    )}
                    {resendMutation.isLoading && <Loader size={16} className='animate-spin' />}
                </div>
            </InputWithLabel>
            <button
                type='submit'
                disabled={mutation.isLoading}
                className={cn(
                    'flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg py-1.5 font-medium',
                    'disabled:cursor-not-allowed disabled:bg-brand-600/80',
                    'bg-brand-600 text-white focus-visible:ring-brand-600/75'
                )}>
                <span>Continue</span>
                <Loader size={16} className={cn('animate-spin', !mutation.isLoading && 'hidden')} />
            </button>
        </form>
    );
}
