import { defineField, defineType } from 'sanity';

export default defineType({
    name: 'site',
    title: 'Site',
    type: 'document',
    liveEdit: true,
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            validation: Rule => [Rule.required()],
        }),
        defineField({
            name: 'url',
            title: 'Url',
            type: 'url',
            validation: Rule => [Rule.required()],
        }),
    ],
});
