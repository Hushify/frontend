const { InjectManifest } = require('workbox-webpack-plugin');

/** @type {import('next').NextConfig} */
module.exports = {
    // output: 'standalone', // Uncomment this for node based deployments
    reactStrictMode: true,
    swcMinify: true,
    images: {
        domains: [
            'dummyimage.com',
            'images.unsplash.com',
            'hushify.io',
            'cdn.sanity.io',
            process.env.NEXT_PUBLIC_DOMAIN ?? 'hushify.io',
        ],
        formats: ['image/avif', 'image/webp'],
    },
    experimental: {
        appDir: true,
        nextScriptWorkers: true,
    },
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
        if (!isServer) {
            config.plugins.push(
                new InjectManifest({
                    swSrc: './src/lib/services/service-worker.ts',
                    swDest: '../public/sw.js',
                    include: ['__nothing__'],
                })
            );
        }

        return config;
    },
};
