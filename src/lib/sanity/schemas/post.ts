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
            validation: Rule => Rule.required(),
        }),
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            description: 'Must be between 15 and 70 characters.',
            validation: Rule => [Rule.min(15), Rule.max(70)],
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: 'title',
                maxLength: 96,
            },
            validation: Rule => Rule.required(),
        }),
        defineField({
            name: 'body',
            title: 'Body',
            type: 'blockContent',
            validation: Rule => Rule.required(),
        }),
        defineField({
            name: 'excerpt',
            title: 'Excerpt',
            type: 'text',
            description:
                'Meta description, must be between 70 and 160 characters.',
            validation: Rule => [Rule.min(70), Rule.max(160)],
        }),
        defineField({
            name: 'author',
            title: 'Author',
            type: 'reference',
            to: { type: 'author' },
            validation: Rule => Rule.required(),
        }),
        defineField({
            name: 'image',
            title: 'Image',
            type: 'image',
            options: {
                hotspot: true,
            },
            validation: Rule => Rule.required(),
        }),
        defineField({
            name: 'category',
            title: 'Category',
            type: 'reference',
            to: { type: 'category' },
            validation: Rule => Rule.required(),
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
            validation: Rule => Rule.required(),
        }),
    ],

    preview: {
        select: {
            title: 'title',
            media: 'image',
            author: 'author.name',
            site: 'site.title',
        },
        prepare(selection) {
            const { author, site } = selection;
            return {
                ...selection,
                subtitle: author && `by ${author} | ${site}`,
            };
        },
    },
});
