import Content from '@/content/legal/privacy.mdx';

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
    return (
        <div className='prose prose-base my-8 mx-auto max-w-prose prose-h1:my-6 prose-h2:my-6 prose-h3:my-6 prose-a:text-indigo-600 prose-li:marker:text-gray-600 prose-hr:mx-auto prose-hr:max-w-[48ch] prose-hr:border-gray-600'>
            <Content />
        </div>
    );
}
