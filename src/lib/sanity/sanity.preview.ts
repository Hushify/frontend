import { dataset, projectId } from '@/lib/sanity/sanity-client';
import { definePreview, Params } from 'next-sanity/preview';

function onPublicAccessOnly() {
    throw new Error(`Unable to load preview as you're not logged in`);
}

const usePreview = definePreview({
    projectId,
    dataset,
    onPublicAccessOnly,
});

export const useSanityPreview = <T = any>(query: string, params?: Params) => {
    const sanityAuthToken = JSON.parse(
        localStorage.getItem(`__studio_auth_token_${projectId}`) ?? 'null'
    ) as { token: string } | null;

    return usePreview(sanityAuthToken?.token ?? null, query, params) as T;
};
