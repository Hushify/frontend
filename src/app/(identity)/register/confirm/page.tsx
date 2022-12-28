'use client';

import { apiRoutes, clientRoutes } from '@/data/routes';
import {
    checkPasswordStrength,
    registerConfirm,
    registerOrForgotPassword,
} from '@/services/auth';
import { CryptoService } from '@/services/crypto.worker';
import { useAuthStore } from '@/stores/auth-store';
import { addServerErrors } from '@/utils/addServerErrors';
import { Dialog, Transition } from '@headlessui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import { wrap } from 'comlink';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import qrcode from 'qrcode';
import { Fragment, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import colors from 'tailwindcss/colors';
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

    const setMasterKey = useAuthStore(state => state.setMasterKey);
    const setAsymmetricEncKeyPair = useAuthStore(
        state => state.setAsymmetricEncKeyPair
    );
    const setSigningKeyPair = useAuthStore(state => state.setSigningKeyPair);
    const setStatus = useAuthStore(state => state.setStatus);

    const [isRecoveryKeyModalOpen, setIsRecoveryKeyModalOpen] = useState(false);
    const [recoveryMnemonic, setRecoveryMnemonic] = useState('');
    const [recoveryQr, setRecoveryQr] = useState('');

    useEffect(() => {
        if (recoveryMnemonic) {
            qrcode
                .toDataURL(recoveryMnemonic, {
                    color: {
                        dark: colors.indigo[600],
                        light: colors.white,
                    },
                })
                .then(setRecoveryQr);
        }
    }, [recoveryMnemonic]);

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
            const result = await registerOrForgotPassword(
                apiRoutes.identity.register,
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

    const openRecoveryKeyModal = (recoveryKeyMnemonic: string) => {
        setRecoveryMnemonic(recoveryKeyMnemonic);
        setIsRecoveryKeyModalOpen(true);
        // TODO: Update this properly once Next.js fixes this on their side
        document.title = 'Recovery Key';
    };

    const onSubmit = async (data: ConfirmFormInputs) => {
        try {
            setIsSubmitting(true);

            const pwStrengthResult = checkPasswordStrength(
                data.password,
                data.email
            );
            if (!pwStrengthResult.success) {
                setError('password', {
                    type: 'zxcvbn',
                    message: pwStrengthResult.error,
                });
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

            const keys = await crypto.generateRequiredKeys(data.password);

            const result = await registerConfirm<ConfirmFormInputs>(
                apiRoutes.identity.registerConfirm,
                data.email,
                data.code,
                keys.salt,
                keys.masterKeyBundle,
                keys.recoveryMasterKeyBundle,
                keys.recoveryKeyBundle,
                keys.asymmetricEncKeyBundle,
                keys.signingKeyBundle
            );

            if (result.success) {
                setStatus('authenticated');
                setMasterKey(keys.masterKey);
                setAsymmetricEncKeyPair(
                    keys.asymmetricEncKeyBundle.publicKey,
                    keys.asymmetricEncPrivateKey
                );
                setSigningKeyPair(
                    keys.signingKeyBundle.publicKey,
                    keys.signingPrivateKey
                );
                openRecoveryKeyModal(keys.recoveryMnemonic);
                return;
            }

            addServerErrors(result.errors, setError, Object.keys(data));
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
            <Transition appear show={isRecoveryKeyModalOpen} as={Fragment}>
                <Dialog as='div' className='relative z-10' onClose={() => {}}>
                    <Transition.Child
                        as={Fragment}
                        enter='ease-out duration-300'
                        enterFrom='opacity-0'
                        enterTo='opacity-100'
                        leave='ease-in duration-200'
                        leaveFrom='opacity-100'
                        leaveTo='opacity-0'>
                        <div className='fixed inset-0 bg-black bg-opacity-25' />
                    </Transition.Child>
                    <div className='fixed inset-0 overflow-y-auto'>
                        <div className='flex min-h-full items-center justify-center p-4 text-center'>
                            <Transition.Child
                                as={Fragment}
                                enter='ease-out duration-300'
                                enterFrom='opacity-0 scale-95'
                                enterTo='opacity-100 scale-100'
                                leave='ease-in duration-200'
                                leaveFrom='opacity-100 scale-100'
                                leaveTo='opacity-0 scale-95'>
                                <Dialog.Panel className='w-full max-w-md transform space-y-4 overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all'>
                                    <Dialog.Title
                                        as='h3'
                                        className='text-center text-lg font-bold leading-6 text-gray-900 print:text-xl'>
                                        Recovery Key
                                    </Dialog.Title>

                                    <div className='space-y-2 text-gray-600 print:hidden'>
                                        <p>
                                            This is your recovery key, please
                                            print it and save it somewhere safe.
                                        </p>
                                        <p>
                                            We do not have access to your
                                            password and your master key, so
                                            this key is the only way to recover
                                            your account if you lose your
                                            password.
                                        </p>
                                    </div>

                                    <div className='flex items-center justify-center'>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={recoveryQr}
                                            alt='Recovery QR Code.'
                                            className='rounded-lg border-2 border-gray-300'
                                        />
                                    </div>

                                    <div className='rounded-lg border-2 border-gray-300 p-4'>
                                        <code>{recoveryMnemonic}</code>
                                    </div>

                                    <button
                                        type='button'
                                        onClick={() => window.print()}
                                        className='flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-600 py-1.5 font-medium text-white print:hidden'>
                                        Print
                                    </button>

                                    <button
                                        type='button'
                                        onClick={() =>
                                            push(clientRoutes.drive.index)
                                        }
                                        className='flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-gray-600 py-1.5 font-medium text-white focus-visible:ring-gray-600/75 print:hidden'>
                                        Continue to Drive
                                    </button>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
            <div className='space-y-1 text-center print:hidden'>
                <h1 className='text-2xl font-bold'>One last step</h1>
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
                        autoComplete='email'
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
                        placeholder='Create a password'
                        autoComplete='new-password'
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
                        <div className='flex items-center justify-between text-sm tracking-wide'>
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
