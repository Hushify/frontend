import { ComputedFields, defineDocumentType, makeSource } from 'contentlayer/source-files';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';

const computedFields: ComputedFields = {
    slug: {
        type: 'string',
        resolve: doc => `/${doc._raw.flattenedPath}`,
    },
    slugAsParams: {
        type: 'string',
        resolve: doc => doc._raw.flattenedPath.split('/').slice(1).join('/'),
    },
};

export const Post = defineDocumentType(() => ({
    name: 'Post',
    filePathPattern: `blog/**/*.mdx`,
    contentType: 'mdx',
    fields: {
        title: {
            type: 'string',
            required: true,
        },
        excerpt: {
            type: 'string',
        },
        publishedAt: {
            type: 'date',
            required: true,
        },
        published: {
            type: 'boolean',
            default: true,
        },
        image: {
            type: 'string',
            required: true,
        },
        categories: {
            type: 'list',
            of: { type: 'string' },
            required: true,
        },
        tags: {
            type: 'list',
            of: { type: 'string' },
            required: true,
        },
        authors: {
            // Reference types are not embedded.
            // Until this is fixed, we can use a simple list.
            // type: "reference",
            // of: Author,
            type: 'list',
            of: { type: 'string' },
            required: true,
        },
    },
    computedFields,
}));

export const Author = defineDocumentType(() => ({
    name: 'Author',
    filePathPattern: `authors/**/*.mdx`,
    contentType: 'mdx',
    fields: {
        title: {
            type: 'string',
            required: true,
        },
        description: {
            type: 'string',
        },
        avatar: {
            type: 'string',
            required: true,
        },
        twitter: {
            type: 'string',
            required: true,
        },
    },
    computedFields,
}));

export const Page = defineDocumentType(() => ({
    name: 'Page',
    filePathPattern: `pages/**/*.mdx`,
    contentType: 'mdx',
    fields: {
        title: {
            type: 'string',
            required: true,
        },
        description: {
            type: 'string',
        },
    },
    computedFields,
}));

export default makeSource({
    contentDirPath: './src/content',
    documentTypes: [Page, Post, Author],
    mdx: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
            rehypeSlug,
            [
                rehypePrettyCode,
                {
                    theme: 'github-dark',
                    onVisitLine(node: any) {
                        // Prevent lines from collapsing in `display: grid` mode, and allow empty
                        // lines to be copy/pasted
                        if (node.children.length === 0) {
                            node.children = [{ type: 'text', value: ' ' }];
                        }
                    },
                    onVisitHighlightedLine(node: any) {
                        node.properties.className.push('line--highlighted');
                    },
                    onVisitHighlightedWord(node: any) {
                        node.properties.className = ['word--highlighted'];
                    },
                },
            ],
            [
                rehypeAutolinkHeadings,
                {
                    properties: {
                        className: [
                            'subheading-anchor',
                            'transition-opacity',
                            'opacity-50',
                            'hover:opacity-100',
                            'w-4',
                            'h-4',
                        ],
                        ariaLabel: 'Link to section',
                    },
                    // make hast node from the following
                    content: {
                        type: 'element',
                        tagName: 'svg',
                        properties: {
                            xmlns: 'http://www.w3.org/2000/svg',
                            viewBox: '0 0 24 24',
                            fill: 'none',
                            stroke: 'currentColor',
                            'stroke-width': '2',
                            'stroke-linecap': 'round',
                            'stroke-linejoin': 'round',
                            class: 'lucide lucide-link',
                        },
                        children: [
                            {
                                type: 'element',
                                tagName: 'path',
                                properties: {
                                    d: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71',
                                },
                                children: [],
                            },
                            {
                                type: 'element',
                                tagName: 'path',
                                properties: {
                                    d: 'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
                                },
                                children: [],
                            },
                        ],
                    },
                },
            ],
        ],
    },
});
