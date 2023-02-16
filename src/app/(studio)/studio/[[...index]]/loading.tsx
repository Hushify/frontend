'use client';

import config from '@/lib/sanity/sanity.config';
import { NextStudioLoading } from 'next-sanity/studio/loading';

function Loading() {
    return <NextStudioLoading config={config} />;
}

export default Loading;
