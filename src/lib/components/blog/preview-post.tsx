'use client';

import { SinglePost } from '@/lib/components/blog/post';
import { useSanityPreview } from '@/lib/sanity/sanity.preview';
import { Post } from '@/lib/sanity/types';
import { notFound } from 'next/navigation';

export const PreviewSinglePost = ({
    query,
    slug,
}: {
    query: string;
    slug: string;
}) => {
    const post = useSanityPreview<Post | null>(query, { slug });

    if (!post) {
        return notFound();
    }

    return <SinglePost post={post} />;
};
