import { dataset, projectId } from '@/lib/sanity/sanity-client';
import { schemaTypes } from '@/lib/sanity/schemas';
import { visionTool } from '@sanity/vision';
import { defineConfig } from 'sanity';
import { unsplashImageAsset } from 'sanity-plugin-asset-source-unsplash';
import { media } from 'sanity-plugin-media';
import { deskTool } from 'sanity/desk';

export default defineConfig({
    name: 'Hushify_CMS',
    title: 'Hushify CMS',
    basePath: '/studio',

    projectId,
    dataset,

    plugins: [deskTool(), visionTool(), unsplashImageAsset(), media()],

    schema: {
        types: schemaTypes,
    },
});
