'use client';

import { usePreview } from '@/lib/sanity/sanity.preview';

export const PreviewBlog = ({ query }: { query: string }) => {
    const posts = usePreview(null, query);

    return <pre>{posts.length}</pre>;
};
