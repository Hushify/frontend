import { promises as fs } from 'fs';
import path from 'path';

import { markdownToHtml } from '@/lib/utils/markdown';

export const metadata = {
    title: 'Privacy',
    openGraph: {
        title: 'Privacy',
    },
    twitter: {
        title: 'Privacy',
    },
};

export default async function Privacy() {
    const markdown = await fs.readFile(
        path.join(process.cwd(), 'src', 'app', '(marketing)', 'privacy', 'privacy.md'),
        'utf8'
    );
    const html = await markdownToHtml(markdown);

    return (
        <div
            dangerouslySetInnerHTML={{ __html: html }}
            className='prose prose-base my-8 mx-auto max-w-prose prose-h1:my-6 prose-h2:my-6 prose-h3:my-6 prose-a:text-indigo-600 prose-li:marker:text-gray-600 prose-hr:mx-auto prose-hr:max-w-[48ch] prose-hr:border-gray-600'
        />
    );
}
