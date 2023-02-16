'use client';

import { NextStudio } from 'next-sanity/studio';

import config from '@/lib/sanity/sanity.config';

function StudioPage() {
    return <NextStudio config={config} />;
}

export default StudioPage;
