import { DetailedHTMLProps, ForwardedRef, InputHTMLAttributes, ReactNode, forwardRef } from 'react';
import { FieldError } from 'react-hook-form';

import { cn } from '@/lib/utils/cn';

export const InputWithLabel = forwardRef(function InputWithLabel(
    {
        id,
        error,
        className,
        labelClassName,
        children,
        ...props
    }: DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & {
        error: FieldError | undefined;
        labelClassName?: string;
        children?: ReactNode | undefined;
    },
    ref: ForwardedRef<HTMLInputElement>
) {
    return (
        <div className='flex flex-col gap-1'>
            <label
                htmlFor={id}
                className={cn(
                    'flex items-center justify-between text-sm tracking-wide',
                    labelClassName
                )}>
                {children}
            </label>
            <input
                id={id}
                {...props}
                className={cn(
                    'h-9 bg-transparent placeholder:text-slate-400',
                    className,
                    !!error && 'border-red-600'
                )}
                ref={ref}
            />
            <small className='text-red-600'>{error?.message}</small>
        </div>
    );
});
