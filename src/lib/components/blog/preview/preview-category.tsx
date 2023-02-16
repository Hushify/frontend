'use client';

import { CategoryList } from '@/lib/components/blog/category-list';
import { useSanityPreview } from '@/lib/sanity/sanity.preview';
import { CategoryPosts } from '@/lib/sanity/types';

export function PreviewCategory({
    query,
    category,
}: {
    query: string;
    category: string;
}) {
    const categoryWithPosts = useSanityPreview<CategoryPosts>(query, {
        category,
    });
    return <CategoryList categoryWithPosts={categoryWithPosts} />;
}
