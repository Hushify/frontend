const { withContentlayer } = require('next-contentlayer');

/** @type {import('next').NextConfig} */
const nextConfig = {
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

module.exports = withContentlayer(nextConfig);
