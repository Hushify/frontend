import matter from 'gray-matter';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeExternalLinks from 'rehype-external-links';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify/lib';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse/lib';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

export const frontMatter = async (markdown: string) => {
    const { data } = matter(markdown);
    return data as { title: string };
};

export const markdownToHtmlWithMatter = async (markdown: string) => {
    const { content, data } = matter(markdown);

    const result = await unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkRehype, {
            allowDangerousHtml: true,
        })
        .use(rehypeExternalLinks, { rel: ['noreferrer'], target: '_blank' })
        .use(rehypeRaw)
        .use(rehypeSanitize)
        .use(rehypeAutolinkHeadings)
        .use(rehypeSlug)
        .use(rehypeStringify)
        .process(content);

    return {
        html: result.toString(),
        matter: data as { title: string },
    };
};

export const markdownToHtml = async (markdown: string) => {
    const result = await unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkRehype, {
            allowDangerousHtml: true,
        })
        .use(rehypeExternalLinks, { rel: ['noreferrer'], target: '_blank' })
        .use(rehypeRaw)
        .use(rehypeSanitize)
        .use(rehypeAutolinkHeadings)
        .use(rehypeSlug)
        .use(rehypeStringify)
        .process(markdown);

    return result.toString();
};
