import { dataset, projectId } from '@/lib/sanity/sanity-client';
import { schemaTypes } from '@/lib/sanity/schemas';
import { scheduledPublishing } from '@sanity/scheduled-publishing';
import { visionTool } from '@sanity/vision';
import { defineConfig } from 'sanity';
import { unsplashImageAsset } from 'sanity-plugin-asset-source-unsplash';
import { deskTool } from 'sanity/desk';

export default defineConfig({
    name: 'default',
    title: 'Hushify CMS',
    basePath: '/studio',

    projectId,
    dataset,

    plugins: [
        deskTool(),
        visionTool(),
        unsplashImageAsset(),
        scheduledPublishing(),
    ],

    schema: {
        types: schemaTypes,
    },
});
