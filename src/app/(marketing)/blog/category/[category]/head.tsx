import { client } from '@/lib/sanity/sanity-client';
import { groq } from 'next-sanity';

async function Head({
    params: { category },
}: {
    params: { category: string };
}) {
    const fetchedCategory = await client.fetch<{
        title: string;
        description?: string;
    }>(
        groq`
            *[_type == "category" && slug.current == $category] {
                title,
                description,
            }[0]
        `,
        { category }
    );

    if (!fetchedCategory) {
        return null;
    }

    return (
        <>
            <meta name='keywords' content={fetchedCategory.title} />
            <meta name='og:title' content={fetchedCategory.title} />
            <meta name='twitter:title' content={fetchedCategory.title} />
            <title>{fetchedCategory.title}</title>

            {fetchedCategory.description && (
                <>
                    <meta
                        name='description'
                        content={fetchedCategory.description}
                    />
                    <meta
                        name='og:description'
                        content={fetchedCategory.description}
                    />
                    <meta
                        name='twitter:description'
                        content={fetchedCategory.description}
                    />
                </>
            )}
        </>
    );
}

export default Head;
