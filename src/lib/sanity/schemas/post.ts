import { defineField, defineType } from 'sanity';

export default defineType({
    name: 'post',
    title: 'Post',
    type: 'document',
    fields: [
        defineField({
            name: 'site',
            title: 'Site',
            type: 'reference',
            to: { type: 'site' },
            validation: Rule => [Rule.required()],
        }),
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            validation: Rule => [Rule.required()],
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: 'title',
                maxLength: 96,
            },
            validation: Rule => [Rule.required()],
        }),
        defineField({
            name: 'author',
            title: 'Author',
            type: 'reference',
            to: { type: 'author' },
            validation: Rule => [Rule.required()],
        }),
        defineField({
            name: 'image',
            title: 'Image',
            type: 'image',
            options: {
                hotspot: true,
            },
            validation: Rule => [Rule.required()],
        }),
        defineField({
            name: 'category',
            title: 'Category',
            type: 'reference',
            to: { type: 'category' },
            validation: Rule => [Rule.required()],
        }),
        defineField({
            name: 'tags',
            title: 'Tags',
            type: 'array',
            of: [{ type: 'reference', to: { type: 'tag' } }],
        }),
        defineField({
            name: 'publishedAt',
            title: 'Published at',
            type: 'datetime',
            validation: Rule => [Rule.required()],
        }),
        defineField({
            name: 'excerpt',
            title: 'Excerpt',
            type: 'text',
        }),
        defineField({
            name: 'social_content',
            title: 'Social Content',
            type: 'text',
            validation: Rule => [Rule.max(280)],
        }),
        defineField({
            name: 'body',
            title: 'Body',
            type: 'blockContent',
            validation: Rule => [Rule.required()],
        }),
    ],

    preview: {
        select: {
            title: 'title',
            author: 'author.name',
            media: 'image',
        },
        prepare(selection) {
            const { author } = selection;
            return { ...selection, subtitle: author && `by ${author}` };
        },
    },
});
