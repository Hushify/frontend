import { HTMLAttributeAnchorTarget } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PortableTextReactComponents } from '@portabletext/react';

import { SyntaxHighlighter } from '@/lib/components/blog/syntax-highlighter';
import { urlFor } from '@/lib/sanity/url-for';

export const PortableTextComponents: Partial<PortableTextReactComponents> = {
    types: {
        image: ({ value }) => (
            <div className='mx-auto overflow-hidden'>
                <Image
                    src={urlFor(value).height(384).url()}
                    alt={value.alt || 'Post Image'}
                    height={384}
                    width={682.67}
                    className='aspect-video object-cover'
                />
            </div>
        ),
        code: ({ value: { language, code } }) => (
            <SyntaxHighlighter language={language} code={code} />
        ),
        break: () => <hr />,
    },
    marks: {
        link: ({ children, value, text }) => {
            const link = value.href ?? text;

            const rel = link.startsWith('/') ? 'noreferrer' : undefined;
            const target: HTMLAttributeAnchorTarget = link.startsWith('/')
                ? '_self'
                : '_blank';
            return (
                <Link
                    className='text-blue-600 underline'
                    href={link}
                    rel={rel}
                    target={target}>
                    {children}
                </Link>
            );
        },
    },
};
