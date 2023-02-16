import { client } from '@/lib/sanity/sanity-client';
import ImageUrlBuilder from '@sanity/image-url';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';

const builder = ImageUrlBuilder(client);
export function urlFor(source: SanityImageSource) {
    return builder.image(source);
}
