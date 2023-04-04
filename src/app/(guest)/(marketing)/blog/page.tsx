import { promises as fs } from 'fs';
import path from 'path';
import Link from 'next/link';
import { MDXContent } from 'mdx/types';

export const metadata = {
    title: 'Blog',
    keywords: ['Hushify', 'Blog'],
    openGraph: {
        title: 'Blog',
    },
    twitter: {
        title: 'Blog',
    },
};

export default async function Blog() {
    const posts: (MDXMeta & { slug: string })[] = [];
    const dir = await fs.opendir(path.join(process.cwd(), 'src', 'content', 'posts'));
    for await (const entry of dir) {
        const { meta } = (await import(`@/content/posts/${entry.name}`)) as {
            default: MDXContent;
            meta: MDXMeta;
        };

        posts.push({ ...meta, slug: entry.name.split('.')[0] });
    }

    return (
        <div className='mx-auto my-8 flex max-w-prose flex-col gap-8'>
            <h1 className='text-4xl font-bold'>Blog</h1>
            <ul className='flex flex-col gap-4'>
                {posts
                    .sort(
                        (a, b) =>
                            new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
                    )
                    .map(post => (
                        <li key={post.slug} className='h-full'>
                            <Link
                                href={`/blog/${post.slug}`}
                                className='flex h-full flex-col gap-4 rounded-lg bg-gradient-to-r from-brand-50 via-brand-100 to-brand-200 p-4 shadow-md transition-shadow hover:shadow-lg'>
                                <h2 className='text-2xl font-medium'>{post.title}</h2>
                                <p>{post.excerpt}</p>
                                <div className='text-sm'>
                                    By {post.author} • {post.publishedAt}
                                </div>
                            </Link>
                        </li>
                    ))}
            </ul>
        </div>
    );
}
