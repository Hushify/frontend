import author from '@/lib/sanity/schemas/author';
import blockContent from '@/lib/sanity/schemas/blockContent';
import category from '@/lib/sanity/schemas/category';
import post from '@/lib/sanity/schemas/post';
import site from '@/lib/sanity/schemas/site';
import tag from '@/lib/sanity/schemas/tag';

export const schemaTypes = [post, author, tag, category, blockContent, site];
