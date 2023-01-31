import { createClient } from 'next-sanity';
import { cache } from 'react';

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION!;

const clientWithoutCache = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: typeof document !== 'undefined',
});

// Wrap the cache function in a way that reuses the TypeScript definitions
export const client = cache(clientWithoutCache.fetch.bind(clientWithoutCache));
