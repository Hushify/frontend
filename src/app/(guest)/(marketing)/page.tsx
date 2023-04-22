import Link from 'next/link';

import { clientRoutes } from '@/lib/data/routes';

export default function Home() {
    return (
        <div className='mx-auto max-w-prose py-6 lg:py-10'>
            <div className='prose prose-lg mx-auto space-y-2 text-center'>
                <h2>Privacy, built on open source.</h2>
                <div>
                    Hushify envisions a digital world where privacy is paramount. A world free from
                    invasive tracking, data breaches, and corporate data exploitation. We believe
                    that everyone has the right to secure and private access to their digital
                    assets.
                </div>
                <div>
                    Hushify Drive, our secure cloud storage solution, embodies our commitment to
                    open source and user privacy. By offering end-to-end encryption and putting the
                    power of privacy in the hands of users, we aim to create a more secure and
                    private digital landscape for everyone.
                </div>
                <div>
                    {/* Pricing Page */}
                    <Link href={clientRoutes.identity.register}>Get Started</Link>
                </div>
                <div>
                    {' '}
                    {/* Register Page */}
                    <Link href={clientRoutes.identity.register}>Get 2GB Free Storage</Link>
                </div>

                <ul>
                    <li>
                        Data privacy: End-to-end encryption ensures that only the intended
                        recipients can access and read the stored data. Since the data is encrypted
                        on the user&apos;s device before being uploaded to the cloud, even the
                        storage provider cannot access the content.
                    </li>
                    <li>
                        Confidentiality for sensitive information: End-to-end encryption is
                        especially useful for storing sensitive information, such as personal
                        documents, financial records, or trade secrets, as it ensures that only
                        authorized users can access the data.
                    </li>
                    <li>
                        Increased trust: Users can have greater confidence in the privacy and
                        security of their data when using end-to-end encrypted cloud storage built
                        on open source technology, as they know their data remains encrypted and
                        under their control. This can lead to increased trust in the service
                        provider.
                    </li>
                    <li>
                        Accessibility for all users: Hushify Drive, prioritize a seamless and
                        intuitive user experience, making it easy for users of all technical levels
                        to benefit from the enhanced privacy and security features.
                    </li>
                </ul>

                <div>
                    <h2>Privacy is a cornerstone of personal freedom</h2>
                    <p>
                        Privacy is essential to fostering a vibrant and progressive society, as it
                        enables individuals to express themselves, explore new ideas, and question
                        established norms without fear of reprisal. In the absence of privacy,
                        creativity and innovation become stifled, and true freedom remains
                        unattainable.
                    </p>
                    <p>
                        That&apos;s why Hushify Drive offers a secure cloud storage solution that
                        safeguards your digital files. By combining end-to-end encryption with open
                        source technology, we empower you to take control of your privacy and
                        protect your right to a secure digital life.
                    </p>
                </div>

                <ul>
                    <li>
                        Comprehensive file management: Hushify Drive offers a user-friendly
                        interface for uploading files and folders, renaming items, creating new
                        folders, and organizing your data with simple drag-and-drop functionality.
                        Access your files from anywhere, ensuring seamless productivity and
                        convenience.
                    </li>
                    <li>
                        Easy sharing: Effortlessly share your files and folders with others using
                        secure links, while maintaining end-to-end encryption.
                    </li>
                    <li>
                        Data protection and recovery: Hushify Drive offers version control and
                        recovery options, allowing you to restore deleted files or revert to
                        previous versions, safeguarding your data from accidental loss or unwanted
                        changes.
                    </li>
                    <li>
                        Transparent security with open source: Built on open source, Hushify Drive
                        allows users and security experts to inspect the underlying code, ensuring
                        the integrity of the encryption implementation and promoting trust in the
                        platform&apos;s commitment to privacy and security.
                    </li>
                </ul>

                <div>TODO: Testimonials</div>
                <div>TODO: CTA</div>
                <div>TODO: Footer</div>
            </div>
        </div>
    );
}
