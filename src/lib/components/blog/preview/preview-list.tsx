'use client';

import { List } from '@/lib/components/blog/list';
import { useSanityPreview } from '@/lib/sanity/sanity.preview';
import { Post } from '@/lib/sanity/types';

export function PreviewList({ query }: { query: string }) {
    const posts = useSanityPreview<Post[]>(query);
    return <List posts={posts} />;
}
