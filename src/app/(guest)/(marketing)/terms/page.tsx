import Content from '@/content/legal/terms.mdx';

export const metadata = {
    title: 'Terms',
    openGraph: {
        title: 'Terms',
    },
    twitter: {
        title: 'Terms',
    },
};

export default async function Terms() {
    return (
        <div className='prose prose-base mx-auto my-8 max-w-prose prose-h1:my-6 prose-h2:my-6 prose-h3:my-6 prose-a:text-indigo-600 prose-li:marker:text-gray-600 prose-hr:mx-auto prose-hr:max-w-[48ch] prose-hr:border-gray-600'>
            <Content />
        </div>
    );
}
