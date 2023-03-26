import { Robots as RobotsType } from 'next/dist/lib/metadata/types/metadata-interface';

export default function Robots(): RobotsType {
    return {
        host: `https://${process.env.NEXT_PUBLIC_DOMAIN}`,
        sitemap: `https://${process.env.NEXT_PUBLIC_DOMAIN}/sitemap.xml`,
        rules: {
            userAgent: '*',
            allow: '/',
        },
    };
}
