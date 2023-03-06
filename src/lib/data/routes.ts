export const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ?? 'https://api.hushify.io';

export const clientRoutes = {
    index: '/',
    privacy: '/privacy',
    terms: '/terms',
    blog: { index: '/blog' },
    identity: {
        login: '/login',
        loginConfirm: '/login/confirm',

        register: '/register',
        registerConfirm: '/register/confirm',
        recoveryQr: '/recovery-qr',

        resendConfirmation: '/resend',
        resendConfirmationSuccess: '/resend/success',

        forgotPassword: '/forgot-password',
        forgotPasswordSuccess: '/forgot-password/success',

        resetPassword: '/reset-password',
        resetPasswordSuccess: '/reset-password/success',
    },
    drive: '/drive',
    trash: '/trash',
    settings: '/settings',
};

const nakedApiRoutes = {
    identity: {
        initiateLogin: '/identity/login',
        login: '/identity/login-confirm',
        logout: '/identity/logout',
        refresh: '/identity/refresh',

        register: '/identity/register',
        resendConfirmation: '/identity/resend-confirmation',
        registerConfirm: '/identity/register-confirm',

        forgotPassword: '/identity/forgot-password',

        resetPassword: '/identity/reset-password',
        resetPasswordConfirm: '/identity/reset-password-confirm',
        getUserClaims: '/identity/getuserclaims',
    },
    drive: {
        list: '/drive/list',
        stats: '/drive/stats',
        createFolder: '/drive/create-folder',
        deleteNodes: '/drive/delete-nodes',
        updateMetadata: '/drive/update-metadata',
        moveNodes: '/drive/move-nodes',
        multipart: {
            create: '/drive/create-multipart-upload',
            commit: '/drive/commit-multipart-upload',
            cancel: '/drive/cancel-multipart-upload',
        },
    },
};

export const apiRoutes = {
    identity: {
        initiateLogin: apiUrl + nakedApiRoutes.identity.initiateLogin,
        login: apiUrl + nakedApiRoutes.identity.login,
        refresh: apiUrl + nakedApiRoutes.identity.refresh,
        register: apiUrl + nakedApiRoutes.identity.register,
        resendConfirmation: apiUrl + nakedApiRoutes.identity.resendConfirmation,
        registerConfirm: apiUrl + nakedApiRoutes.identity.registerConfirm,
        logout: apiUrl + nakedApiRoutes.identity.logout,
        forgotPassword: apiUrl + nakedApiRoutes.identity.forgotPassword,

        resetPassword: apiUrl + nakedApiRoutes.identity.resetPassword,
        resetPasswordConfirm:
            apiUrl + nakedApiRoutes.identity.resetPasswordConfirm,
        getUserClaims: apiUrl + nakedApiRoutes.identity.getUserClaims,
    },
    drive: {
        list: apiUrl + nakedApiRoutes.drive.list,
        stats: apiUrl + nakedApiRoutes.drive.stats,
        createFolder: apiUrl + nakedApiRoutes.drive.createFolder,
        deleteNodes: apiUrl + nakedApiRoutes.drive.deleteNodes,
        updateMetadata: apiUrl + nakedApiRoutes.drive.updateMetadata,
        moveNodes: apiUrl + nakedApiRoutes.drive.moveNodes,
        multipart: {
            create: apiUrl + nakedApiRoutes.drive.multipart.create,
            commit: apiUrl + nakedApiRoutes.drive.multipart.commit,
            cancel: apiUrl + nakedApiRoutes.drive.multipart.cancel,
        },
    },
};
