import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { allPages } from 'contentlayer/generated';

import { Mdx } from '@/lib/components/mdx';

type Props = {
    params: {
        slug: string[];
    };
};

function getPageFromParams(params: { slug: string[] | undefined } | undefined) {
    const slug = params?.slug?.join('/');
    const page = allPages.find(page => page.slugAsParams === slug) || null;
    return page;
}

export function generateMetadata({ params }: Props): Metadata {
    const page = getPageFromParams(params);

    if (!page) {
        return {};
    }

    const url = process.env.NEXT_PUBLIC_DOMAIN;

    const ogUrl = new URL(`https://${url}/api/og-image`);
    ogUrl.searchParams.set('title', page.title);

    return {
        title: page.title,
        description: page.description,
        openGraph: {
            title: page.title,
            description: page.description,
            type: 'article',
            url: `https://${process.env.NEXT_PUBLIC_DOMAIN}/${page.slugAsParams}`,
            images: [
                {
                    url: ogUrl.toString(),
                    width: 1200,
                    height: 630,
                    alt: page.title,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: page.title,
            description: page.description,
            images: [ogUrl.toString()],
        },
    };
}

export function generateStaticParams(): Props['params'][] {
    return allPages.map(page => ({
        slug: page.slugAsParams.split('/'),
    }));
}

export default function PagePage({ params }: Props) {
    const page = getPageFromParams(params);

    if (!page) {
        return notFound();
    }

    return (
        <article className='mx-auto max-w-prose py-6 lg:py-10'>
            <div className='space-y-4'>
                <h1 className='inline-block text-4xl font-extrabold tracking-tight text-gray-900 lg:text-5xl'>
                    {page.title}
                </h1>
                {page.description && <p className='text-xl text-gray-600'>{page.description}</p>}
            </div>
            <hr className='my-4 border-gray-200' />
            <Mdx code={page.body.code} />
        </article>
    );
}
