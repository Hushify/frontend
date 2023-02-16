import { List } from '@/lib/components/blog/list';
import { PreviewList } from '@/lib/components/blog/preview/preview-list';
import { Loader } from '@/lib/components/loader';
import { PreviewSuspense } from '@/lib/components/sanity/preview-suspense';
import { client } from '@/lib/sanity/sanity-client';
import { Post } from '@/lib/sanity/types';
import { groq } from 'next-sanity';
import { previewData } from 'next/headers';

export const revalidate = 3600;

const query = groq`
    *[_type == "post" && site->title in ["Hushify", "All"]] {
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
`;

const previewQuery = groq`
    *[_type == "post"] {
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
`;

function getPosts() {
    return client.fetch<Post[]>(query);
}

async function BlogPage() {
    if (previewData()) {
        return (
            <PreviewSuspense fallback={<Loader />}>
                <PreviewList query={previewQuery} />
            </PreviewSuspense>
        );
    }

    const posts = await getPosts();

    return <List posts={posts} />;
}

export default BlogPage;
