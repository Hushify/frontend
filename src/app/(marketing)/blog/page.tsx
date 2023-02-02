import { client } from '@/lib/sanity/sanity-client';
import { groq } from 'next-sanity';
import { previewData } from 'next/headers';

const getPosts = () =>
    client(groq`
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
    `);

const BlogPage = async () => {
    if (previewData()) {
        return <div>Preview</div>;
    }

    const posts = await getPosts();

    return (
        <pre className='prose prose-lg overflow-auto font-mono'>
            {JSON.stringify(posts, null, 2)}
        </pre>
    );
};

export default BlogPage;
