import { addServerErrors } from '@/lib/utils/addServerErrors';
import { useMutation, UseMutationOptions } from '@tanstack/react-query';

export function useFormMutation<T, U>(
    onSubmit: (data: T) => Promise<U>,
    setError?: (
        fieldName: keyof T,
        error: { type: string; message: string }
    ) => void,
    onErrorCb?: (error: unknown) => void,
    options?: Omit<
        UseMutationOptions<U, unknown, T, unknown>,
        'mutationFn' | 'onError'
    >
) {
    return useMutation({
        ...options,
        mutationFn: data => onSubmit(data),
        onError(error, variables, _context) {
            if (setError) {
                const message = error
                    ? (error as Error).message
                    : 'Something went wrong!';
                addServerErrors(
                    { errors: [message] },
                    setError,
                    Object.keys(variables as object)
                );
            }
            onErrorCb?.(error);
        },
    });
}
