import {
    DetailedHTMLProps,
    ForwardRefExoticComponent,
    InputHTMLAttributes,
    PropsWithChildren,
    ReactNode,
    RefAttributes,
    forwardRef,
} from 'react';
import { FieldError } from 'react-hook-form';

import { cn } from '../utils/cn';

export const InputWithLabel: ForwardRefExoticComponent<
    PropsWithChildren<
        DetailedHTMLProps<
            InputHTMLAttributes<HTMLInputElement>,
            HTMLInputElement
        > & {
            error: FieldError | undefined;
            labelClassName?: string;
            children?: ReactNode | undefined;
        } & RefAttributes<HTMLInputElement>
    >
> = forwardRef(
    ({ id, error, className, labelClassName, children, ...props }, ref) => (
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
    )
);

InputWithLabel.displayName = 'InputWithLabel';
