import { NextApiRequest, NextApiResponse } from 'next';

const Preview = (req: NextApiRequest, res: NextApiResponse) => {
    res.setPreviewData({});
    res.writeHead(307, { Location: '/' });
    return res.end();
};

export default Preview;
