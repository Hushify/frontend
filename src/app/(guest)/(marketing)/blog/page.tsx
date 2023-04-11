import Image from 'next/image';
import Link from 'next/link';
import { allPosts } from 'contentlayer/generated';
import { compareDesc, intlFormat } from 'date-fns';

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
    const posts = allPosts.sort((a, b) => {
        return compareDesc(new Date(a.publishedAt), new Date(b.publishedAt));
    });

    return (
        <div className='container mx-auto max-w-4xl py-6 lg:py-10'>
            <div className='flex flex-col items-start gap-4 md:flex-row md:justify-between md:gap-8'>
                <h1 className='inline-block text-4xl font-extrabold tracking-tight text-gray-900 lg:text-5xl'>
                    Blog
                </h1>
            </div>
            <hr className='my-8 border-gray-200' />
            {posts?.length ? (
                <div className='grid gap-10 sm:grid-cols-2'>
                    {posts.map((post, index) => (
                        <article key={post._id} className='group relative flex flex-col space-y-2'>
                            <Image
                                src={post.image}
                                alt={post.title}
                                width={800}
                                height={450}
                                className='aspect-video w-full rounded-md border border-gray-200 bg-gray-100 transition-colors group-hover:border-indigo-600'
                                priority={index <= 1}
                            />
                            <h2 className='text-2xl font-extrabold'>{post.title}</h2>
                            {post.excerpt && <p className='text-gray-600'>{post.excerpt}</p>}
                            <p className='text-sm text-gray-600'>
                                {intlFormat(new Date(post.publishedAt), {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </p>
                            <Link href={post.slug} className='absolute inset-0'>
                                <span className='sr-only'>View Article</span>
                            </Link>
                        </article>
                    ))}
                </div>
            ) : (
                <p>No posts published.</p>
            )}
        </div>
    );
}
