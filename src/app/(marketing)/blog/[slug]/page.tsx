import { SinglePost } from '@/lib/components/blog/post';
import { PreviewSinglePost } from '@/lib/components/blog/preview-post';
import { Loader } from '@/lib/components/loader';
import { PreviewSuspense } from '@/lib/components/sanity/preview-suspense';
import { client } from '@/lib/sanity/sanity-client';
import { Post } from '@/lib/sanity/types';
import { groq } from 'next-sanity';
import { previewData } from 'next/headers';
import { notFound } from 'next/navigation';

const query = groq`
    *[_type == "post" && site->title == "Hushify" && slug.current == $slug] {
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
        excerpt
    }[0]
`;

const getPost = (slug: string) => client.fetch<Post | null>(query, { slug });

export const revalidate = 3600;

export const generateStaticParams = async () => {
    const slugs = await client.fetch<{ slug: { current: string } }[]>(groq`
        *[_type == "post" && site->title == "Hushify"] {
            slug { current }
        }
    `);

    return slugs.map(({ slug }) => ({
        slug: slug.current,
    }));
};

const Page = async ({ params: { slug } }: { params: { slug: string } }) => {
    if (previewData()) {
        return (
            <PreviewSuspense fallback={<Loader />}>
                <PreviewSinglePost query={query} slug={slug} />
            </PreviewSuspense>
        );
    }

    const post = await getPost(slug);

    if (!post) {
        return notFound();
    }

    return <SinglePost post={post} />;
};

export default Page;
