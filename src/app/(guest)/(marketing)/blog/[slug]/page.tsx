import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { allAuthors, allPosts } from 'contentlayer/generated';
import { intlFormat } from 'date-fns';
import { ChevronLeft } from 'lucide-react';
import { Article, WithContext } from 'schema-dts';

import { Mdx } from '@/lib/components/mdx';
import { clientRoutes } from '@/lib/data/routes';

export const dynamicParams = false;

const getImageUrl = (title: string) =>
    `https://${process.env.NEXT_PUBLIC_DOMAIN}/api/og-image?title=${encodeURIComponent(title)}`;

export async function generateMetadata({
    params: { slug },
}: {
    params: { slug: string };
}): Promise<Metadata> {
    const post = allPosts.find(post => post.slugAsParams === slug);

    if (!post) {
        return {};
    }

    return {
        title: post.title,
        description: post.excerpt,
        keywords: ['Hushify', ...post.tags],
        openGraph: {
            title: post.title,
            description: post.excerpt,
            images: getImageUrl(post.title),
            publishedTime: post.publishedAt,
            type: 'article',
            url: `https://${process.env.NEXT_PUBLIC_DOMAIN}/blog/${slug}`,
        },
        twitter: {
            title: post.title,
            description: post.excerpt,
            images: getImageUrl(post.title),
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
    return allPosts.map(post => ({ slug: post.slugAsParams }));
}

export default async function Post({ params: { slug } }: { params: { slug: string } }) {
    const post = allPosts.find(post => post.slugAsParams === slug);

    if (!post) {
        return notFound();
    }

    const authors = post.authors.map(author =>
        allAuthors.find(({ slug }) => slug === `/authors/${author}`)
    );

    const jsonLd: WithContext<Article> = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        image: `https://${process.env.NEXT_PUBLIC_DOMAIN}${post.image}`,
        description: post.excerpt,
        keywords: post.tags.join(', '),
        author: authors.filter(Boolean).map(author => ({
            '@type': 'Person',
            name: author.title,
            url: `https://twitter.com/${author.twitter}`,
        })),
        publisher: {
            '@type': 'Organization',
            name: 'Hushify',
            url: `https://${process.env.NEXT_PUBLIC_DOMAIN}`,
        },
        datePublished: post.publishedAt,
    };

    return (
        <article className='container relative mx-auto max-w-3xl py-6 lg:py-10'>
            <script
                type='application/ld+json'
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <div>
                {post.publishedAt && (
                    <time dateTime={post.publishedAt} className='block text-sm text-gray-600'>
                        Published on{' '}
                        {intlFormat(new Date(post.publishedAt), {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </time>
                )}
                <h1 className='mt-2 inline-block text-4xl font-extrabold leading-tight text-gray-900 lg:text-5xl'>
                    {post.title}
                </h1>
                {post.authors?.length ? (
                    <div className='mt-4 flex space-x-4'>
                        {authors.map(author =>
                            author ? (
                                <Link
                                    key={author._id}
                                    href={`https://twitter.com/${author.twitter}`}
                                    target='_blank'
                                    rel='noreferrer'
                                    className='flex items-center space-x-2 text-sm'>
                                    <Image
                                        src={author.avatar}
                                        alt={author.title}
                                        width={42}
                                        height={42}
                                        className='rounded-full'
                                    />
                                    <div className='flex-1 text-left leading-tight'>
                                        <p className='font-medium text-gray-900'>{author.title}</p>
                                        <p className='text-[12px] text-gray-600'>
                                            @{author.twitter}
                                        </p>
                                    </div>
                                </Link>
                            ) : null
                        )}
                    </div>
                ) : null}
            </div>
            {post.image && (
                <Image
                    src={post.image}
                    alt={post.title}
                    width={720}
                    height={405}
                    className='my-8 aspect-video w-full rounded-md border border-gray-200 bg-gray-100 transition-colors group-hover:border-gray-900'
                    priority
                />
            )}
            <Mdx code={post.body.code} />
            <hr className='my-4 border-gray-200' />
            <div className='flex justify-center py-6 lg:py-10'>
                <Link
                    href={clientRoutes.blog.index}
                    className='inline-flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-900'>
                    <ChevronLeft className='mr-2 h-4 w-4' />
                    See all posts
                </Link>
            </div>
        </article>
    );
}
