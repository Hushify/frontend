import { PreviewBlog } from '@/lib/components/preview-blog';
import { PreviewSuspense } from '@/lib/components/sanity/PreviewSuspense';
import { client } from '@/lib/sanity/sanity-client';
import { Loader2 } from 'lucide-react';
import { groq } from 'next-sanity';
import { previewData } from 'next/headers';

const query = groq`
*[_type == "post"] {
    _id,
    categories[]-> {
        ...,
    },
    tags[]-> {
        ...,
    },
    image-> {
        ...,
    },
    slug {
        current
    },
    title
}
`;

const getPosts = () => client(query);

const Loader = () => (
    <div>
        <Loader2 />
    </div>
);

const BlogPage = async () => {
    if (previewData()) {
        return (
            <PreviewSuspense fallback={<Loader />}>
                <PreviewBlog query={query} />
            </PreviewSuspense>
        );
    }

    const posts = await getPosts();

    return (
        <pre className='prose prose-lg overflow-auto font-mono'>
            {JSON.stringify(posts, null, 2)}
        </pre>
    );
};

export default BlogPage;
