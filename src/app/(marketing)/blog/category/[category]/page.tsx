import { CategoryList } from '@/lib/components/blog/category-list';
import { PreviewCategory } from '@/lib/components/blog/preview/preview-category';
import { Loader } from '@/lib/components/loader';
import { PreviewSuspense } from '@/lib/components/sanity/preview-suspense';
import { client } from '@/lib/sanity/sanity-client';
import { CategoryPosts } from '@/lib/sanity/types';
import { groq } from 'next-sanity';
import { previewData } from 'next/headers';

const query = groq`
    *[_type == "category" && slug.current == $category] {
        _id,
        description,
        title,
        "posts": *[_type=='post' && site->title in ["Hushify", "All"] && references(^._id)] {
            _id,
            publishedAt,
            category-> {
                _id,
                description,
                title,
                slug,
            },
            tags[]-> {
                _id,
                description,
                title,
                slug,
            },
            image,
            author-> {
                _id,
                name,
                image,
                slug,
            },
            slug,
            title,
            body,
            excerpt,
            order
        } | order(order asc, publishedAt desc, _createdAt desc)
    }[0]
`;

const previewQuery = groq`
*[_type == "category" && slug.current == $category] {
    _id,
    description,
    title,
    "posts": *[_type=='post' && references(^._id)] {
            _id,
            publishedAt,
            category-> {
                _id,
                description,
                title,
                slug,
            },
            tags[]-> {
                _id,
                description,
                title,
                slug,
            },
            image,
            author-> {
                _id,
                name,
                image,
                slug,
            },
            slug,
            title,
            body,
            excerpt,
            order
        } | order(order asc, publishedAt desc, _createdAt desc)
    }[0]
`;

const getCategoryWithPosts = (category: string) =>
    client.fetch<CategoryPosts>(query, { category });

export const revalidate = 3600;

export const generateStaticParams = async () => {
    const categories = await client.fetch<{ slug: { current: string } }[]>(groq`
        *[_type == "category"] {
            slug { current }
        }
    `);

    return categories.map(({ slug }) => ({
        category: slug.current,
    }));
};

const CategoryPage = async ({
    params: { category },
}: {
    params: { category: string };
}) => {
    if (previewData()) {
        return (
            <PreviewSuspense fallback={<Loader />}>
                <PreviewCategory query={previewQuery} category={category} />
            </PreviewSuspense>
        );
    }

    const categoryWithPosts = await getCategoryWithPosts(category);

    return <CategoryList categoryWithPosts={categoryWithPosts} />;
};

export default CategoryPage;
