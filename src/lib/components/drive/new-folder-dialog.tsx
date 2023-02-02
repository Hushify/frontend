'use client';

import { useAlertStore } from '@/lib/components/alert';
import { InputWithLabel } from '@/lib/components/input-with-label';
import { apiRoutes } from '@/lib/data/routes';
import { useFormMutation } from '@/lib/hooks/use-form-mutation';
import { CryptoService } from '@/lib/services/crypto.worker';
import {
    createFolder,
    DriveList,
    FolderNodeDecrypted,
} from '@/lib/services/drive';
import { useAuthStore } from '@/lib/stores/auth-store';
import { addServerErrors } from '@/lib/utils/addServerErrors';
import { Dialog, Transition } from '@headlessui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { wrap } from 'comlink';
import { Loader } from 'lucide-react';
import {
    Dispatch,
    Fragment,
    SetStateAction,
    useCallback,
    useMemo,
} from 'react';
import { useForm } from 'react-hook-form';
import sanitize from 'sanitize-filename';
import zod from 'zod';

type NewFolderInputs = {
    errors: string;
    folderName: string;
};

const newFolderSchema = zod
    .object({
        folderName: zod
            .string()
            .trim()
            .min(1, 'Folder Name is required.')
            .refine(
                folderName => sanitize(folderName) === folderName,
                'Folder Name is not valid.'
            ),
    })
    .required();

export const NewFolderDialog = ({
    isNewFolderOpen,
    setIsNewFolderOpen,
}: {
    isNewFolderOpen: boolean;
    setIsNewFolderOpen: Dispatch<SetStateAction<boolean>>;
}) => {
    const queryClient = useQueryClient();
    const currentFolder = queryClient.getQueryData<string | null>([
        'currentFolder',
    ]);

    const key = currentFolder
        ? `${apiRoutes.drive.list}?folderId=${currentFolder}`
        : apiRoutes.drive.list;
    const existingFolders = queryClient.getQueryData<DriveList>([key]);

    const accessToken = useAuthStore(state => state.accessToken)!;
    const masterKey = useAuthStore(state => state.masterKey)!;

    const currentFolderKey = useMemo(
        () =>
            existingFolders && existingFolders.breadcrumbs.length > 0
                ? existingFolders?.breadcrumbs.find(c => c.id === currentFolder)
                      ?.key ?? masterKey
                : masterKey,
        [currentFolder, existingFolders, masterKey]
    );

    const {
        register,
        handleSubmit,
        setError,
        clearErrors,
        formState: { errors },
        resetField,
    } = useForm<NewFolderInputs>({
        resolver: zodResolver(newFolderSchema),
    });

    const addAlert = useAlertStore(state => state.addAlert);

    const resetForm = useCallback(() => {
        resetField('folderName');
        resetField('errors');
        clearErrors();
    }, [clearErrors, resetField]);

    const onSubmit = useCallback(
        async (data: NewFolderInputs) => {
            if (
                existingFolders &&
                existingFolders.folders.findIndex(
                    f => f.metadata.name === data.folderName
                ) !== -1
            ) {
                addServerErrors(
                    {
                        folderName: ['Folder already exists.'],
                    },
                    setError,
                    Object.keys(data)
                );
                return;
            }

            const worker = new Worker(
                new URL('@/lib/services/crypto.worker', import.meta.url),
                {
                    type: 'module',
                    name: 'hushify-crypto-worker',
                }
            );

            const crypto = wrap<typeof CryptoService>(worker);

            const keyBundle = await crypto.generateFolderKey(currentFolderKey);

            const metadata = {
                name: data.folderName,
                modified: new Date().toUTCString(),
                created: new Date().toUTCString(),
            };

            const metadataBundle = await crypto.encryptMetadata(
                keyBundle.folderKey,
                metadata
            );

            const result = await createFolder(
                apiRoutes.drive.createFolder,
                accessToken,
                currentFolder ?? null,
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
                resetForm();
                addAlert('Folder created!', 'success');
                queryClient.setQueryData<DriveList>([key], queryData => {
                    if (!queryData) {
                        return undefined;
                    }

                    const folders: FolderNodeDecrypted[] = [
                        ...queryData.folders,
                        {
                            id: result.data.id,
                            folderKey: keyBundle.folderKeyB64,
                            metadata,
                        },
                    ];

                    folders.sort((a, b) =>
                        a.metadata.name.localeCompare(
                            b.metadata.name,
                            undefined,
                            {
                                numeric: true,
                            }
                        )
                    );

                    return {
                        ...queryData,
                        folders,
                    };
                });
                return;
            }

            addServerErrors(result.errors, setError, Object.keys(data));
        },
        [
            accessToken,
            addAlert,
            currentFolder,
            currentFolderKey,
            existingFolders,
            key,
            queryClient,
            resetForm,
            setError,
            setIsNewFolderOpen,
        ]
    );

    const mutation = useFormMutation(onSubmit, setError);

    return (
        <Transition appear show={isNewFolderOpen} as={Fragment}>
            <Dialog
                as='div'
                onClose={() => {
                    resetForm();
                    setIsNewFolderOpen(false);
                }}
                className='relative z-50'>
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
                                    className='text-lg font-bold leading-6 text-gray-900 print:text-xl'>
                                    Create New Folder
                                </Dialog.Title>

                                <form
                                    className='space-y-2'
                                    onSubmit={handleSubmit(data =>
                                        mutation.mutateAsync(data)
                                    )}>
                                    <small className='text-red-600'>
                                        {errors.errors?.message}
                                    </small>

                                    <InputWithLabel
                                        error={errors.folderName}
                                        type='text'
                                        id='folderName'
                                        autoComplete='folderName'
                                        placeholder='Folder Name'
                                        {...register('folderName')}>
                                        Folder Name
                                    </InputWithLabel>

                                    <button
                                        type='submit'
                                        disabled={mutation.isLoading}
                                        className='button button-primary'>
                                        <span>Create</span>
                                        <Loader
                                            size={16}
                                            className={clsx(
                                                'animate-spin',
                                                !mutation.isLoading && 'hidden'
                                            )}
                                        />
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
