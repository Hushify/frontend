'use client';

import 'qrcode';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile';
import { motion } from 'framer-motion';
import { Loader, ScanLine } from 'lucide-react';
import { useForm } from 'react-hook-form';
import QrCodeReader, { QRCode } from 'react-qrcode-reader';
import zod from 'zod';

import { InputWithLabel } from '@/lib/components/input-with-label';
import { clientRoutes } from '@/lib/data/routes';
import { detectWebcam } from '@/lib/feature-detection/detect-camera';
import { useFormMutation } from '@/lib/hooks/use-form-mutation';
import {
    checkPasswordStrength,
    register as registerApi,
    registerConfirm,
} from '@/lib/services/auth';
import CryptoWorker from '@/lib/services/comlink-crypto';
import { useAuthStore } from '@/lib/stores/auth-store';
import { addServerErrors } from '@/lib/utils/addServerErrors';
import { cn } from '@/lib/utils/cn';

type ConfirmFormInputs = {
    errors: string;
    code: string;
    email: string;
    recoveryKey: string;
    password: string;
};

const confirmSchema = zod
    .object({
        email: zod.string().email(),
        code: zod.string().length(6, 'Code must be exactly 6 characters.'),
        recoveryKey: zod
            .string()
            .min(1, 'Recovery Key can not be empty.')
            .refine(
                key => key && key.split(' ').length === 24,
                'Recovery key must be exactly 24 words.'
            ),
        password: zod
            .string()
            .min(10, 'Password must be at least 10 characters long.')
            .max(64, 'Password can not exceed 64 characters.'),
    })
    .required();

const RESEND_TIME = 30;

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

    const [resendTimer, setResendTimer] = useState(RESEND_TIME);

    useEffect(() => {
        const interval = setInterval(() => {
            if (resendTimer >= RESEND_TIME) {
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
        const result = await registerApi(searchParams?.get('email') as string);

        if (!result.success) {
            addServerErrors(result.errors, setError, ['errors', 'email']);
            return null;
        }

        setResendTimer(60);
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

    const captchaRef = useRef<TurnstileInstance | undefined>();

    const onSubmit = async (data: ConfirmFormInputs) => {
        const captchaResponse = captchaRef.current?.getResponse();
        if (!captchaResponse) {
            setError('errors', {
                type: 'captcha',
                message: 'Please complete the captcha.',
            });
            captchaRef.current?.reset();
            return null;
        }

        const pwStrengthResult = checkPasswordStrength(
            data.password,
            data.email
        );

        if (!pwStrengthResult.success) {
            setError('password', {
                type: 'zxcvbn',
                message: pwStrengthResult.error,
            });
            return null;
        }

        const crypto = CryptoWorker.instance;
        const keys = await crypto.generateRequiredKeys(data.password);

        const result = await registerConfirm<ConfirmFormInputs>(
            data.email,
            data.code,
            keys.cryptoProperties,
            captchaResponse
        );

        if (result.success) {
            setData({
                status: 'authenticated',
                masterKey: keys.masterKey,
                publicKey: keys.cryptoProperties.asymmetricKeyBundle.publicKey,
                privateKey: keys.asymmetricPrivateKey,
                signingPublicKey:
                    keys.cryptoProperties.signingKeyBundle.publicKey,
                signingPrivateKey: keys.signingPrivateKey,
                recoveryKeyMnemonic: keys.recoveryMnemonic,
            });
            push(clientRoutes.identity.recoveryQr);
            return null;
        }

        addServerErrors(result.errors, setError, Object.keys(data));
    };

    const confirmMutation = useFormMutation(onSubmit, setError);

    const [webcamAvailable, setWebcamAvailable] = useState(false);
    const [qrReaderEnabled, setQrReaderEnabled] = useState(false);

    useEffect(() => {
        detectWebcam().then(async value => {
            setWebcamAvailable(value);
        });
    }, []);

    const handleRead = (code: QRCode) => {
        console.log(code);
    };

    return (
        <motion.div
            className='w-full sm:max-w-[300px]'
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}>
            <div className='space-y-1 text-center print:hidden'>
                <h1 className='text-2xl font-bold'>One last step</h1>
                <div className='text-sm text-slate-600'>
                    We just sent you a one time code on your email.
                </div>
            </div>

            {webcamAvailable && qrReaderEnabled && (
                <QrCodeReader
                    delay={100}
                    width={500}
                    height={500}
                    onRead={handleRead}
                />
            )}

            <form
                className='mt-4 space-y-3'
                onSubmit={handleSubmit(data =>
                    confirmMutation.mutateAsync(data)
                )}>
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
                        htmlFor='recoveryKey'
                        className='flex items-center justify-between text-sm tracking-wide'>
                        <span>Recovery Key</span>
                        <button
                            onClick={() => setQrReaderEnabled(webcamAvailable)}
                            type='button'
                            className='underline'>
                            <ScanLine className='h-4 w-4' />
                        </button>
                    </label>
                    <textarea
                        id='recoveryKey'
                        placeholder='Recovery Key'
                        autoComplete='recoveryKey'
                        rows={4}
                        className={cn(
                            'h-9 bg-transparent placeholder:text-slate-400',
                            !!errors.password && 'border-red-600'
                        )}
                        {...register('recoveryKey')}
                    />
                    <small className='text-red-600'>
                        {errors.recoveryKey?.message}
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
                        placeholder='Create a password'
                        autoComplete='new-password'
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
                    <div className='flex items-center justify-between'>
                        {resendTimer <= 0 ? (
                            <button
                                disabled={
                                    resendMutation.isLoading ||
                                    confirmMutation.isLoading
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
                {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
                    <div className='flex flex-col gap-1'>
                        <Turnstile
                            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                            options={{
                                theme: 'light',
                            }}
                            ref={captchaRef}
                            onError={captchaRef?.current?.reset}
                            autoResetOnExpire
                        />
                    </div>
                )}
                <button
                    type='submit'
                    disabled={
                        confirmMutation.isLoading || resendMutation.isLoading
                    }
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
                            !confirmMutation.isLoading && 'hidden'
                        )}
                    />
                </button>
            </form>
        </motion.div>
    );
}

export default Confirm;
