'use client';

import config from '@/lib/sanity/sanity.config';
import { NextStudioLoading } from 'next-sanity/studio/loading';

const Loading = () => <NextStudioLoading config={config} />;

export default Loading;
