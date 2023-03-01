'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Loader } from 'lucide-react';
import { useForm } from 'react-hook-form';
import zod from 'zod';

import { InputWithLabel } from '@/lib/components/input-with-label';
import { apiRoutes, clientRoutes } from '@/lib/data/routes';
import { useFormMutation } from '@/lib/hooks/use-form-mutation';
import { register as registerApi } from '@/lib/services/auth';
import { addServerErrors } from '@/lib/utils/addServerErrors';
import { cn } from '@/lib/utils/cn';

type RegisterFormInputs = {
    errors: string;
    email: string;
};

const registerSchema = zod
    .object({
        email: zod.string().email('Please check your email.'),
    })
    .required();

function Register() {
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<RegisterFormInputs>({ resolver: zodResolver(registerSchema) });

    const { push } = useRouter();

    const onSubmit = async (data: RegisterFormInputs) => {
        const result = await registerApi<RegisterFormInputs>(
            apiRoutes.identity.register,
            data.email
        );

        if (!result.success) {
            addServerErrors(result.errors, setError, Object.keys(data));
            return null;
        }

        const params = new URLSearchParams({
            email: data.email,
        });

        push(`${clientRoutes.identity.registerConfirm}?${params.toString()}`);
    };

    const mutation = useFormMutation(onSubmit, setError);

    return (
        <motion.div
            className='w-full'
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}>
            <div className='space-y-1 text-center'>
                <h1 className='text-2xl font-bold'>Sign Up</h1>
                <div className='text-sm text-slate-600'>
                    Already have an account?{' '}
                    <Link
                        href={clientRoutes.identity.login}
                        className='text-brand-600 underline'>
                        Login
                    </Link>
                </div>
            </div>

            <form
                className='mt-4 space-y-3'
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

            <div className='my-6 flex justify-center'>
                <hr className='w-1/2 border-gray-400' />
            </div>

            <div className='mx-auto max-w-[300px] text-center text-sm text-gray-600'>
                By clicking continue, you agree to our{' '}
                <Link
                    href={clientRoutes.terms}
                    className='text-brand-600 underline'>
                    Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                    href={clientRoutes.privacy}
                    className='text-brand-600 underline'>
                    Privacy Policy
                </Link>
                .
            </div>
        </motion.div>
    );
}

export default Register;
