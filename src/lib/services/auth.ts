import { apiRoutes } from '@/lib/data/routes';
import { getErrors } from '@/lib/services/common';
import { UserCryptoProperties } from '@/lib/types/crypto';
import { ResponseMessage, SuccessResponse } from '@/lib/types/http';
import { zxcvbnAsync } from '@/lib/utils/zxcvbn';

export async function register<T>(email: string): Promise<ResponseMessage<T, null>> {
    const response = await fetch(apiRoutes.identity.register, {
        method: 'POST',
        body: JSON.stringify({
            email,
        }),
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (response.ok) {
        return { success: true, data: null };
    }

    const errors = await getErrors<T>(response);
    return { success: false, errors };
}

export async function registerConfirm<T>(
    email: string,
    code: string,
    cryptoProperties: UserCryptoProperties
): Promise<ResponseMessage<T, null>> {
    const response = await fetch(apiRoutes.identity.registerConfirm, {
        method: 'POST',
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({
            email,
            code,
            cryptoProperties,
        }),
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (response.ok) {
        return { success: true, data: null };
    }

    const errors = await getErrors<T>(response);
    return { success: false, errors };
}

export async function resetPassword<T>(email: string): Promise<ResponseMessage<T, null>> {
    const response = await fetch(apiRoutes.identity.resetPassword, {
        method: 'POST',
        body: JSON.stringify({
            email,
        }),
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (response.ok) {
        return { success: true, data: null };
    }

    const errors = await getErrors<T>(response);
    return { success: false, errors };
}

export async function resetPasswordConfirm<T>(
    url: string,
    userId: string,
    code: string,
    cryptoProperties: UserCryptoProperties
): Promise<ResponseMessage<T, undefined>> {
    const response = await fetch(apiRoutes.identity.resetPasswordConfirm, {
        method: 'POST',
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({
            userId,
            code,
            cryptoProperties,
        }),
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (response.ok) {
        return { success: true, data: undefined };
    }

    const errors = await getErrors<T>(response);
    return { success: false, errors };
}

export async function initiateLogin<T>(email: string): Promise<ResponseMessage<T, undefined>> {
    const response = await fetch(apiRoutes.identity.initiateLogin, {
        method: 'POST',
        body: JSON.stringify({
            email,
        }),
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (response.ok) {
        return { success: true, data: undefined };
    }

    const errors = await getErrors<T>(response);
    return { success: false, errors };
}

export async function login<T>(
    email: string,
    code: string
): Promise<
    ResponseMessage<
        T,
        {
            encryptedAccessToken: string;
            accessTokenNonce: string;
            serverPublicKey: string;
            cryptoProperties: UserCryptoProperties;
        }
    >
> {
    const response = await fetch(apiRoutes.identity.login, {
        method: 'POST',
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({
            email,
            code,
        }),
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (response.ok) {
        const data = (await response.json()) as {
            encryptedAccessToken: string;
            accessTokenNonce: string;
            serverPublicKey: string;
            cryptoProperties: UserCryptoProperties;
        };
        return { success: true, data };
    }

    const errors = await getErrors<T>(response, 'Invalid username/password.');
    return { success: false, errors };
}

export async function refreshToken<T>(): Promise<
    ResponseMessage<
        T,
        {
            encryptedAccessToken: string;
            accessTokenNonce: string;
            serverPublicKey: string;
        }
    >
> {
    const response = await fetch(apiRoutes.identity.refresh, {
        method: 'POST',
        credentials: 'include',
        mode: 'cors',
    });

    if (response.ok) {
        return {
            success: true,
            data: (await response.json()) as {
                encryptedAccessToken: string;
                accessTokenNonce: string;
                serverPublicKey: string;
            },
        };
    }

    const errors = await getErrors<T>(response);
    return { success: false, errors, status: response.status };
}

export function logout(): Promise<Response> {
    return fetch(apiRoutes.identity.logout, {
        method: 'POST',
        credentials: 'include',
        mode: 'cors',
    });
}

export async function checkPasswordStrength(
    password: string,
    ...userInputs: (string | number)[]
): Promise<SuccessResponse<undefined> | { success: false; error: string }> {
    const zxcvbnResult = await zxcvbnAsync(password, userInputs);

    if (zxcvbnResult.feedback.suggestions.includes('pwned')) {
        return {
            success: false,
            error: 'This password has been previously compromised. Please choose a different password.',
        };
    }

    if (zxcvbnResult.score <= 2) {
        let message = 'Your password is not strong enough.';
        zxcvbnResult.feedback.suggestions.forEach(s => {
            message += `\\n- ${s}`;
        });

        return {
            success: false,
            error: message,
        };
    }

    return { success: true, data: undefined };
}

export function isTokenExpired(token: string) {
    const data = token.split('.')?.[1];
    return data ? Date.now() >= (JSON.parse(atob(data)) as { exp: number }).exp * 1000 : true;
}

export function getClaim(token: string, claimType: string): string | undefined {
    const data = token.split('.')?.at(1);
    return data
        ? (JSON.parse(atob(data)) as Record<string, string | undefined>)[claimType]
        : undefined;
}
