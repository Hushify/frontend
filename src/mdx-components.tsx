import Link from 'next/link';
import { MDXComponents } from 'mdx/types';

export function useMDXComponents(components: MDXComponents): MDXComponents {
    return {
        a: ({ href, children, ref, ...props }) => {
            if (href && href.startsWith('http')) {
                return (
                    <a {...props} ref={ref} target='_blank' rel='noreferrer'>
                        {children}
                    </a>
                );
            }

            return (
                <Link href={href as string} {...props}>
                    {children}
                </Link>
            );
        },
        ...components,
    };
}
