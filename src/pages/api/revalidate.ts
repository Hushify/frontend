import type { NextApiRequest, NextApiResponse } from 'next';
import { parseBody } from 'next-sanity/webhook';

export { config } from 'next-sanity/webhook';

const validTypes = ['post', 'category'];

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
            return null;
        }

        const slug = body.slug as { current: string } | undefined;
        if (!slug) {
            const message = 'No slug was provided';
            res.status(400).json({ message });
            return null;
        }

        const { _type: type } = body;

        if (!validTypes.includes(type)) {
            res.status(401).json({
                message: 'Invalid type',
                type,
            });
            return null;
        }

        const baseRoute = '/blog';

        if (type === 'post') {
            await res.revalidate(`${baseRoute}/${slug.current}`);
        }

        if (type === 'category') {
            await res.revalidate(`${baseRoute}/category/${slug.current}`);
        }

        await res.revalidate(baseRoute);
        res.status(200).json({ message: 'Updated routes' });
        return null;
    } catch (err) {
        res.status(500).json({
            message: typeof err === 'string' ? err : (err as Error).message,
        });
    }
}
