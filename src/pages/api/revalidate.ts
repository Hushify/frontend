/* eslint-disable no-underscore-dangle */
import type { NextApiRequest, NextApiResponse } from 'next';
import { parseBody } from 'next-sanity/webhook';

export default async function revalidate(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const { isValidSignature, body } = await parseBody(
            req,
            process.env.SANITY_REVALIDATE_SECRET
        );

        if (!isValidSignature) {
            const message = 'Invalid signature';
            res.status(401).json({ message });
            return;
        }

        const slug = body.slug as { current: string } | undefined;
        if (!slug) {
            const message = 'No slug was provided';
            res.status(400).json({ message });
            return;
        }

        if (body._type !== 'post' && body._type !== 'author') {
            res.status(401).json({
                message: 'Invalid type',
                type: body._type,
            });
            return;
        }

        let route = '/blog';

        if (body._type === 'post') {
            route = `${route}/${slug.current}`;
        }

        if (body._type === 'author') {
            route = `${route}/author/${slug.current}`;
        }

        await res.revalidate(route);
        await res.revalidate('/blog');
        res.status(200).json({ message: 'Updated routes' });
        return;
    } catch (err) {
        res.status(500).json({
            message: typeof err === 'string' ? err : (err as Error).message,
        });
    }
}
