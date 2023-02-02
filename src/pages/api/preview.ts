import { NextApiRequest, NextApiResponse } from 'next';

const Preview = (req: NextApiRequest, res: NextApiResponse) => {
    res.setPreviewData({});
    res.writeHead(307, { Location: '/' });
    res.end();
};

export default Preview;
