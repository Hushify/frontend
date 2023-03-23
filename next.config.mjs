import addMdx from '@next/mdx';
import remarkGfm from 'remark-gfm';

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
    images: {
        domains: [process.env.NEXT_PUBLIC_DOMAIN ?? 'hushify.io'],
        formats: ['image/avif', 'image/webp'],
    },
    experimental: {
        appDir: true,
        mdxRs: true,
    },
};

const withMdx = addMdx({
    extension: /\.mdx?$/,
    options: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [],
        // If you use `MDXProvider`, uncomment the following line.
        // providerImportSource: "@mdx-js/react",
    },
});

export default withMdx(nextConfig);
