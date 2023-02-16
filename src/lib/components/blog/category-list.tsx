import { CategoryPosts } from '@/lib/sanity/types';
import { List } from './list';

export function CategoryList({
    categoryWithPosts,
}: {
    categoryWithPosts: CategoryPosts;
}) {
    return (
        <div className='my-8 flex flex-col gap-4'>
            <div className='container prose-base lg:prose-lg'>
                <h1>{categoryWithPosts.title}</h1>
                {categoryWithPosts.description && (
                    <p>{categoryWithPosts.description}</p>
                )}
            </div>
            <List posts={categoryWithPosts.posts} />
        </div>
    );
}
