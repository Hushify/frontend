'use client';

import { NextStudioLoading } from 'next-sanity/studio/loading';

import config from '@/lib/sanity/sanity.config';

function Loading() {
    return <NextStudioLoading config={config} />;
}

export default Loading;
