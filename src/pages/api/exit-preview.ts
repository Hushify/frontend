import { NextApiRequest, NextApiResponse } from 'next';

const ExitPreview = (req: NextApiRequest, res: NextApiResponse) => {
    res.clearPreviewData();
    res.writeHead(307, { Location: '/' });
    res.end();
};

export default ExitPreview;
