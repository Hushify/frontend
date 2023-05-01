'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { Disclosure } from '@headlessui/react';
import { Minus, Plus } from 'lucide-react';

import { clientRoutes } from '@/lib/data/routes';

const faqs: {
    question: string;
    answer: () => ReactNode;
}[] = [
    {
        question: 'How does end-to-end encryption work in Hushify?',
        answer: () => (
            <>
                End-to-end encryption ensures that your data is encrypted on your device before
                it&apos;s uploaded to the cloud. Only you hold the decryption keys, making it
                impossible for anyone else (including us) to access your data without your
                permission.{' '}
                <Link href={clientRoutes.security} className='text-brand-600 hover:underline'>
                    Explore our security model.
                </Link>
            </>
        ),
    },
    {
        question: 'Is this free to use?',
        answer: () =>
            'Yes, we have a free tier that gives you 2GB of free storage. And we are open source under AGPL license so you can host it yourself. However, premium plans with additional storage capacity, and support will be available for a subscription fee soon.',
    },
    {
        question: 'Sounds good, how do I get started?',
        answer: () => (
            <>
                To start using Hushify, simply{' '}
                <Link
                    href={clientRoutes.identity.register}
                    className='text-brand-600 hover:underline'>
                    create an account
                </Link>{' '}
                with an email address and start uploading files, no credit card required.
            </>
        ),
    },
    {
        question: 'What is the maximum file size I can upload?',
        answer: () =>
            'There is no theoritical limit, however you are limited by your allocated storage capacity.',
    },
    {
        question: 'Can I share files with others?',
        answer: () =>
            'Yes, we allow you to securely share files with others by using shareable links. The recipients do not need an account to access the encrypted files.',
    },
    {
        question: 'How do I recover my data if I lose my encryption keys?',
        answer: () => (
            <>
                Due to the nature of end-to-end encryption, it&apos;s crucial to keep your password
                and your recovery key safe. If you lose your password, you can use your recovery key
                to recover your account. However, if you lose both your password and recovery key,
                we can not help you recover your data. It is strongly recommended to create secure
                backups of your recovery key.{' '}
                <Link
                    href={clientRoutes.identity.resetPassword}
                    className='text-brand-600 hover:underline'>
                    Recover your account here.
                </Link>
            </>
        ),
    },
    {
        question: 'How can I access Hushify on my device?',
        answer: () =>
            'At the moment, you can access Hushify via a web browser, but we are working on native clients for Windows, Mac, Linux, iOS and Android and a CLI for Windows, Mac and Linux.',
    },
];

export function Faq() {
    return (
        <div className='mx-auto max-w-7xl px-6 py-12 sm:py-20 lg:px-8'>
            <div className='mx-auto max-w-4xl divide-y divide-gray-900/10'>
                <h2 className='text-2xl font-bold leading-10 tracking-tight text-gray-900'>
                    Frequently asked questions
                </h2>
                <dl className='mt-10 space-y-6 divide-y divide-gray-900/10'>
                    {faqs.map(faq => (
                        <Disclosure as='div' key={faq.question} className='pt-6'>
                            {({ open }) => (
                                <>
                                    <dt>
                                        <Disclosure.Button className='flex w-full items-start justify-between text-left text-gray-900'>
                                            <span className='text-base font-semibold leading-7'>
                                                {faq.question}
                                            </span>
                                            <span className='ml-6 flex h-7 items-center'>
                                                {open ? (
                                                    <Minus className='h-6 w-6' aria-hidden='true' />
                                                ) : (
                                                    <Plus className='h-6 w-6' aria-hidden='true' />
                                                )}
                                            </span>
                                        </Disclosure.Button>
                                    </dt>
                                    <Disclosure.Panel as='dd' className='mt-2 pr-12'>
                                        <p className='text-base leading-7 text-gray-600'>
                                            {faq.answer()}
                                        </p>
                                    </Disclosure.Panel>
                                </>
                            )}
                        </Disclosure>
                    ))}
                </dl>
            </div>
        </div>
    );
}
