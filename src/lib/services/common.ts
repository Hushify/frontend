import { Errors } from '@/lib/types/http';

export async function getErrors<T>(
    response: Response | undefined,
    defaultError = 'Something went wrong!'
): Promise<Errors<T>> {
    const isJsonProblem = response?.headers
        .get('Content-Type')
        ?.includes('application/problem+json');
    const data = isJsonProblem ? ((await response?.json()) as { errors: Errors<T> }) : null;
    const responseErrors = data?.errors ?? {
        errors: [defaultError],
    };

    return responseErrors;
}
