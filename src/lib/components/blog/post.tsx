import { PortableTextComponents } from '@/lib/components/blog/portable-text-components';
import { Post } from '@/lib/sanity/types';
import { urlFor } from '@/lib/sanity/url-for';
import { PortableText } from '@portabletext/react';
import Image from 'next/image';
import Link from 'next/link';

export const SinglePost = ({ post }: { post: Post }) => (
    <ul className='my-8 mx-auto flex max-w-prose flex-col items-center gap-8'>
        <div className='relative h-64 w-full overflow-hidden rounded-lg'>
            <Image
                src={urlFor(post.image).width(600).height(450).url()}
                alt={post.title}
                fill
                className='object-cover'
            />
            <div className='absolute bottom-0 flex w-full justify-between bg-black/50 p-5 text-white backdrop-blur-xl'>
                <div className='flex items-center gap-2'>
                    <Image
                        src={urlFor(post.author.image)
                            .width(32)
                            .height(32)
                            .url()}
                        height={32}
                        width={32}
                        alt={post.author.name}
                        className='rounded-full border-2 border-white object-cover'
                    />
                    <div>
                        <Link
                            href={`/blog/author/${post.author.slug.current}`}
                            className='font-bold hover:underline'>
                            {post.author.name}
                        </Link>
                        <div className='text-xs font-bold'>
                            {new Date(post.publishedAt).toLocaleDateString(
                                'en-US',
                                {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                }
                            )}
                        </div>
                    </div>
                </div>
                <div>
                    <Link
                        className='flex items-center justify-center rounded-lg bg-brand-600 px-2 py-0.5 text-xs font-bold text-white duration-200 hover:scale-105 hover:bg-amber-600'
                        href={`/blog/category/${post.category.slug.current}`}>
                        {post.category.title}
                    </Link>
                </div>
            </div>
        </div>

        <h1 className='text-center text-xl font-bold leading-relaxed text-indigo-600 group-hover:underline 2xl:text-2xl'>
            {post.title}
        </h1>

        <div className='prose prose-lg'>
            <PortableText
                value={post.body}
                components={PortableTextComponents}
            />
        </div>
    </ul>
);
