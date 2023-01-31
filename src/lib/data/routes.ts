export const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ?? 'https://api.hushify.io';

export const clientRoutes = {
    index: '/',
    privacy: '/privacy',
    terms: '/terms',
    identity: {
        login: '/login',
        loginConfirm: '/login/confirm',
        register: '/register',
        registerConfirm: '/register/confirm',
        resendEmailConfirmation: '/register/resend',
        resendEmailConfirmationSuccess: '/register/resend/success',
        forgotPassword: '/forgot-password',
        forgotPasswordSuccess: '/forgot-password/success',
        resetPassword: '/reset-password',
        resetPasswordSuccess: '/reset-password/success',
    },
    dashboard: {
        index: '/dashboard',
    },
    drive: {
        index: '/drive',
        trash: '/drive/trash',
    },
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

        resetPassword: '/identity/resetpassword',
        getUserClaims: '/identity/getuserclaims',
    },
    drive: {
        list: '/drive/list',
        createFolder: '/drive/create-folder',
        deleteFolder: '/drive/delete-folder',
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
        getUserClaims: apiUrl + nakedApiRoutes.identity.getUserClaims,
    },
    drive: {
        list: apiUrl + nakedApiRoutes.drive.list,
        createFolder: apiUrl + nakedApiRoutes.drive.createFolder,
        deleteFolder: apiUrl + nakedApiRoutes.drive.deleteFolder,
    },
};

export default {
    api: apiRoutes,
    client: clientRoutes,
};
