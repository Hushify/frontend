import {
    ResponseMessage,
    SuccessResponse,
    getErrors,
} from '@/lib/services/common';
import { zxcvbn } from '@/lib/utils/zxcvbn';

export async function register<T>(
    url: string,
    email: string
): Promise<ResponseMessage<T, null>> {
    const response = await fetch(url, {
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
    url: string,
    email: string,
    code: string,
    salt: string,
    masterKeyBundle: {
        nonce: string;
        encKey: string;
    },
    recoveryMasterKeyBundle: {
        nonce: string;
        encKey: string;
    },
    recoveryKeyBundle: {
        nonce: string;
        encKey: string;
    },
    asymmetricEncKeyBundle: {
        nonce: string;
        publicKey: string;
        encPrivateKey: string;
    },
    signingKeyBundle: {
        nonce: string;
        publicKey: string;
        encPrivateKey: string;
    }
): Promise<ResponseMessage<T, undefined>> {
    const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({
            email,
            code,
            salt,
            masterKeyBundle,
            recoveryMasterKeyBundle,
            recoveryKeyBundle,
            asymmetricEncKeyBundle,
            signingKeyBundle,
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

export async function resetPassword<T>(
    url: string,
    email: string
): Promise<ResponseMessage<T, null>> {
    const response = await fetch(url, {
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

export async function passwordResetConfirm<T>(
    url: string,
    userId: string,
    code: string,
    salt: string,
    masterKeyBundle: {
        nonce: string;
        encKey: string;
    },
    recoveryMasterKeyBundle: {
        nonce: string;
        encKey: string;
    },
    recoveryKeyBundle: {
        nonce: string;
        encKey: string;
    },
    asymmetricEncKeyBundle: {
        nonce: string;
        encKey: string;
    },
    signingKeyBundle: {
        nonce: string;
        encKey: string;
    }
): Promise<ResponseMessage<T, undefined>> {
    const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({
            userId,
            code,
            salt,
            masterKeyBundle,
            recoveryMasterKeyBundle,
            recoveryKeyBundle,
            asymmetricEncKeyBundle,
            signingKeyBundle,
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

export async function initiateLogin<T>(
    url: string,
    email: string
): Promise<ResponseMessage<T, undefined>> {
    const response = await fetch(url, {
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

export async function authenticate<T>(
    url: string,
    email: string,
    code: string
): Promise<
    ResponseMessage<
        T,
        {
            salt: string;

            encAccessToken: string;
            encAccessTokenNonce: string;
            serverPublicKey: string;

            masterKeyNonce: string;
            encMasterKey: string;

            asymmetricEncKeyNonce: string;
            asymmetricEncPublicKey: string;
            encAsymmetricPrivateKey: string;

            signingKeyNonce: string;
            signingPublicKey: string;
            encSigningPrivateKey: string;
        }
    >
> {
    const response = await fetch(url, {
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
        const data = await response.json();
        return { success: true, data };
    }

    const errors = await getErrors<T>(response, 'Invalid username/password.');
    return { success: false, errors };
}

export async function refreshToken<T>(url: string): Promise<
    ResponseMessage<
        T,
        {
            encAccessToken: string;
            accessTokenNonce: string;
            serverPublicKey: string;
        }
    >
> {
    const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        mode: 'cors',
    });

    if (response.ok) {
        return { success: true, data: await response.json() };
    }

    const errors = await getErrors<T>(response);
    return { success: false, errors };
}

export function logout(url: string): Promise<Response> {
    return fetch(url, {
        method: 'POST',
        credentials: 'include',
        mode: 'cors',
    });
}

export function checkPasswordStrength(
    password: string,
    ...userInputs: (string | number)[]
): SuccessResponse<undefined> | { success: false; error: string } {
    const zxcvbnResult = zxcvbn(password, userInputs);
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
    return data ? Date.now() >= JSON.parse(atob(data)).exp * 1000 : true;
}

export function getClaim(token: string, claimType: string): string | undefined {
    const data = token.split('.')?.at(1);
    return data ? JSON.parse(atob(data))[claimType] : undefined;
}
