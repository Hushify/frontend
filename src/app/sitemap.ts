import { allPages, allPosts } from 'contentlayer/generated';

export default async function Sitemap() {
    const routes = [
        '',
        '/blog',
        '/login',
        '/login/confirm',
        '/register',
        '/register/confirm',
        '/recovery-key',
    ].map(route => ({
        url: `https://${process.env.NEXT_PUBLIC_DOMAIN}${route}`,
        lastModified: new Date().toISOString().split('T')[0],
    }));

    return [
        ...routes,
        ...allPages.map(page => ({
            url: `https://${process.env.NEXT_PUBLIC_DOMAIN}/${page.slugAsParams}`,
            lastModified: new Date().toISOString().split('T')[0],
        })),
        ...allPosts.map(post => ({
            url: `https://${process.env.NEXT_PUBLIC_DOMAIN}/blog/${post.slugAsParams}`,
            lastModified: post.publishedAt,
        })),
    ];
}
