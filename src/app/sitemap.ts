import { promises as fs } from 'fs';
import path from 'path';
import { Sitemap as SitemapType } from 'next/dist/lib/metadata/types/metadata-interface';

export default async function Sitemap(): Promise<SitemapType> {
    const posts: { url: string; lastModified: string }[] = [];

    const dir = await fs.opendir(path.join(process.cwd(), 'src', 'content', 'posts'));
    for await (const entry of dir) {
        const slug = entry.name.split('.')[0];
        const { meta } = (await import(`@/content/posts/${entry.name}`)) as {
            meta: MDXMeta;
        };

        posts.push({
            url: `https://${process.env.NEXT_PUBLIC_DOMAIN}/blog/${slug}`,
            lastModified: meta.publishedAt,
        });
    }

    const routes = [
        '',
        '/blog',
        '/privacy',
        '/terms',
        '/login',
        '/login/confirm',
        '/register',
        '/register/confirm',
        '/recovery-key',
    ].map(route => ({
        url: `https://${process.env.NEXT_PUBLIC_DOMAIN}${route}`,
        lastModified: new Date().toISOString().split('T')[0],
    }));

    return [...routes, ...posts];
}
