'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Loader } from 'lucide-react';
import { useForm } from 'react-hook-form';
import zod from 'zod';

import { InputWithLabel } from '@/lib/components/input-with-label';
import { clientRoutes } from '@/lib/data/routes';
import { useFormMutation } from '@/lib/hooks/use-form-mutation';
import { initiateLogin, login } from '@/lib/services/auth';
import CryptoWorker from '@/lib/services/comlink-crypto';
import { useAuthStore } from '@/lib/stores/auth-store';
import { addServerErrors } from '@/lib/utils/addServerErrors';
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
        code: zod.string(),
        password: zod.string().min(10).max(64),
    })
    .required();

function Confirm() {
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
            email: searchParams?.get('email') ?? undefined,
        },
    });
    const [showPassword, setShowPassword] = useState(false);
    const setData = useAuthStore(state => state.setData);

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
            searchParams?.get('email') as string
        );

        if (!result.success) {
            addServerErrors(result.errors, setError, ['errors', 'email']);
            return null;
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
        const result = await login<ConfirmFormInputs>(data.email, data.code);

        if (!result.success) {
            addServerErrors(result.errors, setError, Object.keys(data));
            return null;
        }

        const crypto = CryptoWorker.instance;

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
            publicKey:
                result.data.cryptoProperties.asymmetricKeyBundle.publicKey,
            privateKey: keys.asymmetricPrivateKey,
            signingPublicKey:
                result.data.cryptoProperties.signingKeyBundle.publicKey,
            signingPrivateKey: keys.signingPrivateKey,
            accessToken,
        });

        push(clientRoutes.drive);
    };

    const mutation = useFormMutation(onSubmit, setError);

    return (
        <motion.div
            className='w-full sm:max-w-[300px]'
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}>
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
                    className={cn(
                        'flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg py-1.5 font-medium',
                        'disabled:cursor-not-allowed disabled:bg-brand-600/80',
                        'bg-brand-600 text-white focus-visible:ring-brand-600/75'
                    )}>
                    <span>Continue</span>
                    <Loader
                        size={16}
                        className={cn(
                            'animate-spin',
                            !mutation.isLoading && 'hidden'
                        )}
                    />
                </button>
            </form>
        </motion.div>
    );
}

export default Confirm;
