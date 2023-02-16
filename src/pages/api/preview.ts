import { NextApiRequest, NextApiResponse } from 'next';

export default async function Preview(
    req: NextApiRequest,
    res: NextApiResponse
) {
    let destinationUrl = '/';
    const { destination } = req.query;
    if (typeof destination === 'string' && destination.startsWith('/blog')) {
        destinationUrl = destination;
    }
    res.setPreviewData({});
    res.writeHead(307, { Location: destinationUrl });
    return res.end();
}
