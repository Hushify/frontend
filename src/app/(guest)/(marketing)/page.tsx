import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeftRight, GitFork, Lock, Share2 } from 'lucide-react';

import screenshot from '@/lib/assets/hushify-screenshot.png';
import { Faq } from '@/lib/components/faq';
import { clientRoutes } from '@/lib/data/routes';

const features = [
    {
        name: 'End-to-End Encryption',
        description:
            'Hushify provides end-to-end encryption, ensuring your data is secure and protected from unauthorized access, making it a safer alternative to non-e2ee cloud providers.',
        icon: Lock,
    },
    {
        name: 'Open Source',
        description:
            'Being open source, Hushify offers transparency and a collaborative community, fostering trust and continuous improvement in its features and security.',
        icon: GitFork,
    },
    {
        name: 'Easy Sharing',
        description:
            'Effortlessly share your files and folders with others using secure links, while maintaining end-to-end encryption.',
        icon: Share2,
    },
    {
        name: 'Greater Control over Data',
        description:
            'We give you control over your encryption keys, meaning only you can decrypt your data, unlike non-e2ee cloud providers where the provider holds the keys.',
        icon: ArrowLeftRight,
    },
];

export default function Home() {
    return (
        <div>
            <div className='relative py-16 lg:py-32 lg:pb-40'>
                <div className='mx-auto max-w-7xl px-6 lg:px-8'>
                    <div className='mx-auto max-w-2xl text-center'>
                        <h1 className='text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl'>
                            Privacy, built on open source.
                        </h1>
                        <p className='mt-6 text-lg leading-8 text-gray-600'>
                            We envision a digital world where privacy is paramount. We believe that
                            everyone has the right to secure and private access to their digital
                            assets.
                        </p>
                        <div className='mt-10 flex items-center justify-center gap-x-6'>
                            <Link
                                href={clientRoutes.identity.register}
                                className='rounded-md bg-brand-600 px-3.5 py-1.5 text-base font-semibold leading-7 text-white shadow-sm hover:bg-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600'>
                                Get started
                            </Link>
                            <Link
                                href='https://github.com/Hushify'
                                target='_blank'
                                rel='noreferrer'
                                className='flex items-center gap-1 text-base font-semibold leading-7 text-gray-900'>
                                <span>Contribute </span>
                                <span aria-hidden='true'>→</span>
                            </Link>
                        </div>
                    </div>
                    <div className='mt-16 flow-root sm:mt-24'>
                        <div className='-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4'>
                            <Image
                                src={screenshot}
                                alt='App screenshot'
                                width={2432}
                                height={1442}
                                className='rounded-md shadow-2xl ring-1 ring-gray-900/10'
                                placeholder='blur'
                                priority
                            />
                        </div>
                    </div>
                </div>
                <div className='absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]'>
                    <svg
                        className='relative left-[calc(50%+3rem)] h-[21.1875rem] max-w-none -translate-x-1/2 sm:left-[calc(50%+36rem)] sm:h-[42.375rem]'
                        viewBox='0 0 1155 678'>
                        <path
                            fill='url(#b9e4a85f-ccd5-4151-8e84-ab55c66e5aa1)'
                            fillOpacity='.3'
                            d='M317.219 518.975L203.852 678 0 438.341l317.219 80.634 204.172-286.402c1.307 132.337 45.083 346.658 209.733 145.248C936.936 126.058 882.053-94.234 1031.02 41.331c119.18 108.451 130.68 295.337 121.53 375.223L855 299l21.173 362.054-558.954-142.079z'
                        />
                        <defs>
                            <linearGradient
                                id='b9e4a85f-ccd5-4151-8e84-ab55c66e5aa1'
                                x1='1155.49'
                                x2='-78.208'
                                y1='.177'
                                y2='474.645'
                                gradientUnits='userSpaceOnUse'>
                                <stop stopColor='#9089FC' />
                                <stop offset={1} stopColor='#FF80B5' />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
            </div>
            <div className='py-16 lg:py-24'>
                <div className='mx-auto max-w-7xl px-6 lg:px-8'>
                    <div className='mx-auto max-w-2xl lg:text-center'>
                        <h2 className='text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl'>
                            Why Hushify?
                        </h2>
                    </div>
                    <div className='mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl'>
                        <dl className='grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16'>
                            {features.map(feature => (
                                <div key={feature.name} className='relative pl-16'>
                                    <dt className='text-base font-semibold leading-7 text-gray-900'>
                                        <div className='absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600'>
                                            <feature.icon
                                                className='h-6 w-6 text-white'
                                                aria-hidden='true'
                                            />
                                        </div>
                                        {feature.name}
                                    </dt>
                                    <dd className='mt-2 text-base leading-7 text-gray-600'>
                                        {feature.description}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </div>
            </div>
            <div className='mx-auto max-w-7xl py-16 sm:px-6 lg:px-8 lg:py-24'>
                <div className='relative isolate overflow-hidden bg-gray-900 px-6 py-24 text-center shadow-2xl sm:rounded-3xl sm:px-16'>
                    <h2 className='mx-auto max-w-2xl text-4xl font-bold tracking-tight text-white'>
                        Take control of your privacy today.
                    </h2>
                    <div className='mt-10 flex items-center justify-center'>
                        <Link
                            href={clientRoutes.identity.register}
                            className='rounded-md bg-white px-3.5 py-1.5 text-base font-semibold leading-7 text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'>
                            Get Started
                        </Link>
                    </div>
                    <svg
                        xmlns='http://www.w3.org/2000/svg'
                        viewBox='0 0 1024 1024'
                        className='absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2'
                        aria-hidden='true'>
                        <circle
                            cx={512}
                            cy={512}
                            r={512}
                            fill='url(#827591b1-ce8c-4110-b064-7cb85a0b1217)'
                            fillOpacity='0.7'
                        />
                        <defs>
                            <radialGradient
                                id='827591b1-ce8c-4110-b064-7cb85a0b1217'
                                cx={0}
                                cy={0}
                                r={1}
                                gradientUnits='userSpaceOnUse'
                                gradientTransform='translate(512 512) rotate(90) scale(512)'>
                                <stop stopColor='#7775D6' />
                                <stop offset={1} stopColor='#E935C1' stopOpacity={0} />
                            </radialGradient>
                        </defs>
                    </svg>
                </div>
            </div>
            <Faq />
        </div>
    );
}
