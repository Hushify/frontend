import { CategoryPosts } from '@/lib/sanity/types';
import { List } from './list';

export const CategoryList = ({
    categoryWithPosts,
}: {
    categoryWithPosts: CategoryPosts;
}) => (
    <div className='my-8 flex flex-col gap-4'>
        <div className='prose prose-base lg:prose-lg'>
            <h1>{categoryWithPosts.title}</h1>
            {categoryWithPosts.description && (
                <p>{categoryWithPosts.description}</p>
            )}
        </div>
        <List posts={categoryWithPosts.posts} />
    </div>
);