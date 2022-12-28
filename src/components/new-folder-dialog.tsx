'use client';

import { apiRoutes } from '@/data/routes';
import { CryptoService } from '@/services/crypto.worker';
import { createFolder } from '@/services/drive';
import { useAuthStore } from '@/stores/auth-store';
import { addServerErrors } from '@/utils/addServerErrors';
import { Dialog, Transition } from '@headlessui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { wrap } from 'comlink';
import { Dispatch, Fragment, SetStateAction, useState } from 'react';
import { useForm } from 'react-hook-form';
import sanitize from 'sanitize-filename';
import zod from 'zod';
import { useAlertStore } from './alert';

type NewFolderInputs = {
    errors: string;
    folderName: string;
};

const newFolderSchema = zod
    .object({
        folderName: zod.string(),
    })
    .required();

export const NewFolderDialog = ({
    isNewFolderOpen,
    setIsNewFolderOpen,
    slug,
}: {
    isNewFolderOpen: boolean;
    setIsNewFolderOpen: Dispatch<SetStateAction<boolean>>;
    slug: string | undefined;
}) => {
    const queryClient = useQueryClient();

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
        resetField,
    } = useForm<NewFolderInputs>({
        resolver: zodResolver(newFolderSchema),
    });

    const addAlert = useAlertStore(state => state.addAlert);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const accessToken = useAuthStore(state => state.accessToken)!;

    const masterKey = useAuthStore(state => state.masterKey)!;

    const onSubmit = async (data: NewFolderInputs) => {
        try {
            setIsSubmitting(true);

            const folderName = sanitize(data.folderName);

            if (folderName !== data.folderName) {
                addServerErrors(
                    {
                        errors: ['Folder Name is not valid.'],
                    },
                    setError,
                    Object.keys(data)
                );
                return;
            }

            const worker = new Worker(
                new URL('@/services/crypto.worker', import.meta.url),
                {
                    type: 'module',
                    name: 'hushify-crypto-worker',
                }
            );

            const crypto = wrap<typeof CryptoService>(worker);

            const keyBundle = await crypto.generateFolderKey(masterKey);

            const metadata = {
                name: folderName,
                modified: new Date().toUTCString(),
            };

            const metadataBundle = await crypto.encryptMetadata(
                keyBundle.folderKey,
                metadata
            );

            const result = await createFolder(
                apiRoutes.drive.createFolder,
                accessToken,
                null,
                {
                    nonce: metadataBundle.nonce,
                    metadata: metadataBundle.encMetadata,
                },
                {
                    encKey: keyBundle.encFolderKey,
                    nonce: keyBundle.nonce,
                }
            );

            if (result.success) {
                setIsNewFolderOpen(false);
                addAlert('Folder created!', 'success');
                const key = slug
                    ? `${apiRoutes.drive.list}?folderId=${slug}`
                    : apiRoutes.drive.list;
                queryClient.invalidateQueries({
                    queryKey: [key],
                });
                return;
            }

            addServerErrors(result.errors, setError, Object.keys(data));
        } catch (error) {
            const message = error
                ? (error as Error).message
                : 'Something went wrong!';
            addServerErrors({ errors: [message] }, setError, Object.keys(data));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Transition appear show={isNewFolderOpen} as={Fragment}>
            <Dialog
                as='div'
                onClose={() => {
                    resetField('folderName');
                    resetField('errors');
                    setIsNewFolderOpen(false);
                }}>
                <Transition.Child
                    as={Fragment}
                    enter='ease-out duration-300'
                    enterFrom='opacity-0'
                    enterTo='opacity-100'
                    leave='ease-in duration-200'
                    leaveFrom='opacity-100'
                    leaveTo='opacity-0'>
                    <div className='fixed inset-0 bg-black bg-opacity-25' />
                </Transition.Child>
                <div className='fixed inset-0 overflow-y-auto'>
                    <div className='flex min-h-full items-center justify-center p-4 text-center'>
                        <Transition.Child
                            as={Fragment}
                            enter='ease-out duration-300'
                            enterFrom='opacity-0 scale-95'
                            enterTo='opacity-100 scale-100'
                            leave='ease-in duration-200'
                            leaveFrom='opacity-100 scale-100'
                            leaveTo='opacity-0 scale-95'>
                            <Dialog.Panel className='w-full max-w-md transform space-y-4 overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all'>
                                <Dialog.Title
                                    as='h3'
                                    className='text-center text-lg font-bold leading-6 text-gray-900 print:text-xl'>
                                    Create New Folder
                                </Dialog.Title>

                                <form
                                    className='space-y-2'
                                    onSubmit={handleSubmit(onSubmit)}>
                                    <small className='text-red-600'>
                                        {errors.errors?.message}
                                    </small>
                                    <div className='flex flex-col gap-1'>
                                        <label
                                            htmlFor='folderName'
                                            className='flex items-center justify-between text-sm tracking-wide'>
                                            Folder Name
                                        </label>
                                        <input
                                            type='text'
                                            id='folderName'
                                            autoComplete='folderName'
                                            placeholder='Folder Name'
                                            className={clsx(
                                                'h-9 bg-transparent placeholder:text-slate-400',
                                                !!errors.folderName &&
                                                    'border-red-600'
                                            )}
                                            {...register('folderName')}
                                        />
                                        <small className='text-red-600'>
                                            {errors.folderName?.message}
                                        </small>
                                    </div>

                                    <button
                                        type='submit'
                                        disabled={isSubmitting}
                                        className={clsx(
                                            'flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-600 py-1.5 font-medium text-white',
                                            'disabled:cursor-not-allowed disabled:bg-opacity-80'
                                        )}>
                                        <span>Create</span>
                                        <svg
                                            xmlns='http://www.w3.org/2000/svg'
                                            viewBox='0 0 24 24'
                                            fill='none'
                                            stroke='currentColor'
                                            strokeWidth='2'
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            className={clsx(
                                                'h-4 w-4 animate-spin',
                                                !isSubmitting && 'hidden'
                                            )}>
                                            <line
                                                x1='12'
                                                y1='2'
                                                x2='12'
                                                y2='6'
                                            />
                                            <line
                                                x1='12'
                                                y1='18'
                                                x2='12'
                                                y2='22'
                                            />
                                            <line
                                                x1='4.93'
                                                y1='4.93'
                                                x2='7.76'
                                                y2='7.76'
                                            />
                                            <line
                                                x1='16.24'
                                                y1='16.24'
                                                x2='19.07'
                                                y2='19.07'
                                            />
                                            <line
                                                x1='2'
                                                y1='12'
                                                x2='6'
                                                y2='12'
                                            />
                                            <line
                                                x1='18'
                                                y1='12'
                                                x2='22'
                                                y2='12'
                                            />
                                            <line
                                                x1='4.93'
                                                y1='19.07'
                                                x2='7.76'
                                                y2='16.24'
                                            />
                                            <line
                                                x1='16.24'
                                                y1='7.76'
                                                x2='19.07'
                                                y2='4.93'
                                            />
                                        </svg>
                                    </button>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};
