import { SinglePost } from '@/lib/components/blog/post';
import { PreviewSinglePost } from '@/lib/components/blog/preview/preview-post';
import { Loader } from '@/lib/components/loader';
import { PreviewSuspense } from '@/lib/components/sanity/preview-suspense';
import { client } from '@/lib/sanity/sanity-client';
import { Image, Post } from '@/lib/sanity/types';
import { urlFor } from '@/lib/sanity/url-for';
import { Metadata } from 'next';
import { groq } from 'next-sanity';
import { previewData } from 'next/headers';
import { notFound } from 'next/navigation';

export async function generateMetadata({
    params: { slug },
}: {
    params: { slug: string };
}): Promise<Metadata> {
    const post = await client.fetch<{
        title: string;
        excerpt: string;
        image: Image;
        tags: {
            title: string;
        }[];
    }>(
        groq`
            *[_type == "post" && site->title in ["Hushify", "All"] && slug.current == $slug] {
                title,
                excerpt,
                image,
                tags[]->{
                    title,
                }
            }[0]
        `,
        { slug }
    );

    const metadata: Metadata = {};

    if (post.tags && post.tags.length > 0) {
        metadata.keywords = post.tags.map(p => p.title).join(', ');
    }

    if (post.title) {
        metadata.title = post.title;
        metadata.openGraph = { title: post.title };
        metadata.twitter = { title: post.title };
    }

    if (post.excerpt) {
        metadata.description = post.title;
        metadata.openGraph = { description: post.title };
        metadata.twitter = { description: post.title };
    }

    if (post.image) {
        metadata.description = post.title;
        metadata.openGraph = { images: urlFor(post.image).width(500).url() };
        metadata.twitter = { description: post.title };
    }

    return metadata;
}

const query = groq`
    *[_type == "post" && site->title in ["Hushify", "All"] && slug.current == $slug] {
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

const previewQuery = groq`
    *[_type == "post" && slug.current == $slug] {
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

function getPost(slug: string) {
    return client.fetch<Post | null>(query, { slug });
}

export const revalidate = 3600;

export async function generateStaticParams() {
    const slugs = await client.fetch<{ slug: { current: string } }[]>(groq`
        *[_type == "post" && site->title in ["Hushify", "All"]] {
            slug { current }
        }
    `);

    return slugs.map(({ slug }) => ({
        slug: slug.current,
    }));
}

async function PostPage({ params: { slug } }: { params: { slug: string } }) {
    if (previewData()) {
        return (
            <PreviewSuspense fallback={<Loader />}>
                <PreviewSinglePost query={previewQuery} slug={slug} />
            </PreviewSuspense>
        );
    }

    const post = await getPost(slug);

    if (!post) {
        return notFound();
    }

    return <SinglePost post={post} />;
}

export default PostPage;
