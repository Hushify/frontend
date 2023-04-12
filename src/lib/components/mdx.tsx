import { ComponentProps } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useMDXComponent } from 'next-contentlayer/hooks';

import { Callout } from '@/lib/components/callout';
import { cn } from '@/lib/utils/cn';

const components = {
    h1: ({ className, ...props }: ComponentProps<'h1'>) => (
        <h1
            className={cn('mt-2 scroll-m-20 text-4xl font-bold tracking-tight', className)}
            {...props}
        />
    ),
    h2: ({ className, ...props }: ComponentProps<'h2'>) => (
        <h2
            className={cn(
                'mt-10 scroll-m-20 border-b border-b-gray-200 pb-1 text-3xl font-semibold tracking-tight first:mt-0',
                className
            )}
            {...props}
        />
    ),
    h3: ({ className, ...props }: ComponentProps<'h3'>) => (
        <h3
            className={cn('mt-8 scroll-m-20 text-2xl font-semibold tracking-tight', className)}
            {...props}
        />
    ),
    h4: ({ className, ...props }: ComponentProps<'h4'>) => (
        <h4
            className={cn('mt-8 scroll-m-20 text-xl font-semibold tracking-tight', className)}
            {...props}
        />
    ),
    h5: ({ className, ...props }: ComponentProps<'h5'>) => (
        <h5
            className={cn('mt-8 scroll-m-20 text-lg font-semibold tracking-tight', className)}
            {...props}
        />
    ),
    h6: ({ className, ...props }: ComponentProps<'h6'>) => (
        <h6
            className={cn('mt-8 scroll-m-20 text-base font-semibold tracking-tight', className)}
            {...props}
        />
    ),
    a: ({ children, ref, className, ...props }: ComponentProps<'a'>) => {
        const classString = cn('font-medium text-blue-600 underline underline-offset-4', className);

        if (props.href && props.href.startsWith('http')) {
            return (
                <a {...props} ref={ref} target='_blank' rel='noreferrer' className={classString}>
                    {children}
                </a>
            );
        }

        return (
            <Link href={props.href as string} {...props} className={classString}>
                {children}
            </Link>
        );
    },
    p: ({ className, ...props }: ComponentProps<'p'>) => (
        <p className={cn('leading-7 [&:not(:first-child)]:mt-6', className)} {...props} />
    ),
    ul: ({ className, ...props }: ComponentProps<'ul'>) => (
        <ul className={cn('my-6 ml-6 list-disc', className)} {...props} />
    ),
    ol: ({ className, ...props }: ComponentProps<'ol'>) => (
        <ol className={cn('my-6 ml-6 list-decimal', className)} {...props} />
    ),
    li: ({ className, ...props }: ComponentProps<'li'>) => (
        <li className={cn('mt-2', className)} {...props} />
    ),
    blockquote: ({ className, ...props }: ComponentProps<'blockquote'>) => (
        <blockquote
            className={cn(
                'mt-6 border-l-2 border-gray-300 pl-6 italic text-gray-800 [&>*]:text-gray-600',
                className
            )}
            {...props}
        />
    ),
    img: ({ className, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img className={cn('rounded-md border border-gray-200', className)} alt={alt} {...props} />
    ),
    hr: ({ ...props }) => <hr className='my-4 border-gray-200 md:my-8' {...props} />,
    table: ({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
        <div className='my-6 w-full overflow-y-auto'>
            <table className={cn('w-full', className)} {...props} />
        </div>
    ),
    tr: ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
        <tr
            className={cn('m-0 border-t border-gray-300 p-0 even:bg-gray-100', className)}
            {...props}
        />
    ),
    th: ({ className, ...props }: ComponentProps<'th'>) => (
        <th
            className={cn(
                'border border-gray-200 px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right',
                className
            )}
            {...props}
        />
    ),
    td: ({ className, ...props }: ComponentProps<'td'>) => (
        <td
            className={cn(
                'border border-gray-200 px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right',
                className
            )}
            {...props}
        />
    ),
    pre: ({ className, ...props }: ComponentProps<'pre'>) => (
        <pre
            className={cn('mb-4 mt-6 overflow-x-auto rounded-lg bg-gray-900 py-4', className)}
            {...props}
        />
    ),
    code: ({ className, ...props }: ComponentProps<'code'>) => (
        <code
            className={cn(
                'relative rounded border bg-gray-300/25 px-[0.3rem] py-[0.2rem] font-mono text-sm text-gray-600',
                className
            )}
            {...props}
        />
    ),
    Image,
    Callout,
};

type MdxProps = {
    code: string;
};

export function Mdx({ code }: MdxProps) {
    const Component = useMDXComponent(code);

    return (
        <div className='mdx'>
            <Component components={components} />
        </div>
    );
}
