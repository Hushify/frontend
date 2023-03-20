'use client';

import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Loader } from 'lucide-react';
import { useForm } from 'react-hook-form';
import zod from 'zod';

import { InputWithLabel } from '@/lib/components/input-with-label';
import { clientRoutes } from '@/lib/data/routes';
import { register as registerApi } from '@/lib/services/auth';
import { useAuthStore } from '@/lib/stores/auth-store';
import { addServerErrors } from '@/lib/utils/add-server-errors';
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

export function RegisterForm() {
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<RegisterFormInputs>({ resolver: zodResolver(registerSchema) });

    const router = useRouter();
    const setData = useAuthStore(state => state.setData);

    const mutation = useMutation(
        async (data: RegisterFormInputs) => {
            const result = await registerApi<RegisterFormInputs>(data.email);

            if (!result.success) {
                addServerErrors(result.errors, setError, Object.keys(data));
                return null;
            }

            setData({ email: data.email });
            router.push(clientRoutes.identity.registerConfirm);
        },
        {
            onError: () => {
                setError('errors', {
                    message: 'Something went wrong. Please try again.',
                });
            },
        }
    );

    return (
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
    );
}
