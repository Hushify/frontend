import { promises as fs } from 'fs';
import path from 'path';
import { Metadata } from 'next';
import { intlFormat } from 'date-fns';
import { MDXContent } from 'mdx/types';

export const dynamicParams = false;

const getImageUrl = (title: string) =>
    `https://${process.env.NEXT_PUBLIC_DOMAIN}/api/og-image?title=${encodeURIComponent(title)}`;

export async function generateMetadata({
    params: { slug },
}: {
    params: { slug: string };
}): Promise<Metadata> {
    const { meta } = (await import(`@/content/posts/${slug}.mdx`)) as {
        meta: MDXMeta;
    };

    return {
        title: meta.title,
        description: meta.excerpt,
        keywords: ['Hushify', ...meta.tags],
        openGraph: {
            title: meta.title,
            description: meta.excerpt,
            images: getImageUrl(meta.title),
            publishedTime: meta.publishedAt,
            type: 'article',
            url: `https://${process.env.NEXT_PUBLIC_DOMAIN}/blog/${slug}`,
        },
        twitter: {
            title: meta.title,
            description: meta.excerpt,
            images: getImageUrl(meta.title),
            card: 'summary_large_image',
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
    };
}

export async function generateStaticParams() {
    const posts: string[] = [];
    const dir = await fs.opendir(path.join(process.cwd(), 'src', 'content', 'posts'));
    for await (const entry of dir) {
        posts.push(entry.name.split('.')[0]);
    }

    return posts.map(slug => ({ slug }));
}

export default async function Post({ params: { slug } }: { params: { slug: string } }) {
    const { default: Content, meta } = (await import(`@/content/posts/${slug}.mdx`)) as {
        default: MDXContent;
        meta: MDXMeta;
    };

    return (
        <div className='prose prose-base mx-auto py-8 prose-h1:my-3 prose-h2:my-3 prose-h3:my-3 prose-a:text-indigo-600 prose-li:marker:text-gray-600 prose-hr:mx-auto prose-hr:max-w-[48ch] prose-hr:border-gray-600 md:prose-h1:my-4 md:prose-h2:my-4 md:prose-h3:my-4'>
            <div>
                <span className='text-sm font-medium uppercase tracking-wide text-indigo-600'>
                    {meta.category}
                </span>
                <h1 className='font-medium'>{meta.title}</h1>
                <div className='text-sm'>
                    <div className='font-medium'>{meta.author}</div>
                    <div>
                        {intlFormat(new Date(meta.publishedAt), {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </div>
                </div>
            </div>
            <Content />
            <div className='not-prose pt-2'>
                <ul className='flex items-center gap-2 text-sm font-medium text-white'>
                    {meta.tags.map(tag => (
                        <li key={tag} className='rounded-full bg-gray-600 px-3 py-1'>
                            {tag}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
