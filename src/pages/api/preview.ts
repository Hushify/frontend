import { NextApiRequest, NextApiResponse } from 'next';

const Preview = (req: NextApiRequest, res: NextApiResponse) => {
    const { secret } = req.query;

    if (secret !== process.env.NEXT_PREVIEW_TOKEN) {
        return res.status(401).json({ message: 'Invalid token' });
    }

    res.setPreviewData({});
    res.writeHead(307, { Location: '/' });
    return res.end();
};

export default Preview;
