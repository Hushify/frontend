import { Github, Twitter } from 'lucide-react';

export default function Home() {
    return (
        <div className='flex h-full flex-col items-center justify-center gap-6 px-4'>
            <div className='space-y-2 text-center'>
                <h1 className='text-4xl font-bold'>Hushify</h1>
                <h2 className='text-lg'>Privacy, built on open source.</h2>
            </div>
            <div className='flex items-center justify-center gap-3'>
                <a
                    href='https://github.com/Hushify'
                    target='_blank'
                    rel='noreferrer'
                    className='duration-200 ease-out hover:text-brand-600'>
                    <Github />
                </a>
                <a
                    href='https://twitter.com/HushifyIO'
                    target='_blank'
                    rel='noreferrer'
                    className='duration-200 ease-out hover:text-brand-600'>
                    <Twitter />
                </a>
            </div>
        </div>
    );
}
