/** @type {import('next').NextConfig} */
module.exports = {
    reactStrictMode: true,
    swcMinify: true,
    images: {
        domains: [process.env.NEXT_PUBLIC_DOMAIN ?? 'hushify.io'],
        formats: ['image/avif', 'image/webp'],
    },
    experimental: {
        appDir: true,
    },
};
