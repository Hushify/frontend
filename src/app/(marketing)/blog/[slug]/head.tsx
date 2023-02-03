import { client } from '@/lib/sanity/sanity-client';
import { groq } from 'next-sanity';

const Head = async ({ params: { slug } }: { params: { slug: string } }) => {
    const post = await client.fetch<{ title: string }>(
        groq`
            *[_type == "post" && site->title == "Hushify" && slug.current == $slug] {
                title
            }[0]
        `,
        { slug }
    );

    return <title>{post?.title ?? 'Hushify Blog'}</title>;
};

export default Head;
