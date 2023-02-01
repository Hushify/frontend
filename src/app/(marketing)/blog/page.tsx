import { client } from '@/lib/sanity/sanity-client';
import { groq } from 'next-sanity';

type Post = {
    _id: string;
    categories: Category[];
    tags: Tag[];
    slug: PostSlug;
    title: string;
};

type Category = {
    _createdAt: string;
    _id: string;
    _rev: string;
    _type: string;
    _updatedAt: string;
    slug: CategorySlug;
    title: string;
};

type Tag = {
    _createdAt: string;
    _id: string;
    _rev: string;
    _type: string;
    _updatedAt: string;
    slug: CategorySlug;
    title: string;
};

type CategorySlug = {
    _type: string;
    current: string;
};

type PostSlug = {
    current: string;
};

const getPosts = () =>
    client<Post[]>(groq`
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
    const posts = await getPosts();

    return (
        <pre className='prose prose-lg overflow-auto font-mono'>
            {JSON.stringify(posts, null, 2)}
        </pre>
    );
};

export default BlogPage;
