'use client';

import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Loader } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { InputWithLabel } from '@/lib/components/input-with-label';
import { apiRoutes, clientRoutes } from '@/lib/data/routes';
import { useFormMutation } from '@/lib/hooks/use-form-mutation';
import { resetPassword } from '@/lib/services/auth';
import { addServerErrors } from '@/lib/utils/addServerErrors';
import { cn } from '@/lib/utils/cn';

type ResetPasswordFormInputs = {
    errors: string;
    email: string;
};

const resetPasswordSchema = z
    .object({
        email: z.string().email('Please check your email.'),
    })
    .required();

export default function ResetPassword() {
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<ResetPasswordFormInputs>({
        resolver: zodResolver(resetPasswordSchema),
    });

    const { push } = useRouter();

    const onSubmit = async (data: ResetPasswordFormInputs) => {
        const result = await resetPassword<ResetPasswordFormInputs>(
            apiRoutes.identity.resetPassword,
            data.email
        );

        if (!result.success) {
            addServerErrors(result.errors, setError, Object.keys(data));
            return;
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
            <div className='text-center'>
                <h1 className='text-2xl font-bold'>Reset Password</h1>
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
        </motion.div>
    );
}
