import { Dispatch, SetStateAction, useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Dialog from '@radix-ui/react-dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import sanitize from 'sanitize-filename';
import zod from 'zod';

import { InputWithLabel } from '@/lib/components/input-with-label';
import { apiRoutes } from '@/lib/data/routes';
import { CryptoWorkerInstance } from '@/lib/services/comlink-crypto';
import { createFolder } from '@/lib/services/drive';
import { useAuthStore } from '@/lib/stores/auth-store';
import { DriveList, FolderNodeDecrypted } from '@/lib/types/drive';
import { addServerErrors } from '@/lib/utils/add-server-errors';
import { cn } from '@/lib/utils/cn';

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
            .refine(folderName => sanitize(folderName) === folderName, 'Folder Name is not valid.'),
    })
    .required();

export function NewFolder({
    folders,
    currentFolderId,
    currentFolderKey,
    isNewFolderOpen,
    setIsNewFolderOpen,
}: {
    folders: undefined | FolderNodeDecrypted[];
    currentFolderId: string | null;
    currentFolderKey: string;
    isNewFolderOpen: boolean;
    setIsNewFolderOpen: Dispatch<SetStateAction<boolean>>;
}) {
    const queryClient = useQueryClient();

    const queryKey = currentFolderId
        ? `${apiRoutes.drive.list}?folderId=${currentFolderId}`
        : apiRoutes.drive.list;

    const accessToken = useAuthStore(state => state.accessToken)!;

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

    const resetForm = useCallback(() => {
        resetField('folderName');
        resetField('errors');
        clearErrors();
    }, [clearErrors, resetField]);

    const mutation = useMutation(
        async (data: NewFolderInputs) => {
            if (folders && folders.findIndex(f => f.metadata.name === data.folderName) !== -1) {
                addServerErrors(
                    {
                        folderName: ['Folder already exists.'],
                    },
                    setError,
                    Object.keys(data)
                );
                return null;
            }

            const crypto = CryptoWorkerInstance;

            const keyBundle = await crypto.generateFolderKey(currentFolderKey);

            const metadata = {
                name: data.folderName,
                modified: new Date().toISOString(),
                created: new Date().toISOString(),
            };

            const metadataBundle = await crypto.encryptMetadata(keyBundle.folderKey, metadata);

            const result = await createFolder(
                accessToken,
                currentFolderId ?? null,
                metadataBundle,
                {
                    encryptedKey: keyBundle.encryptedFolderKey,
                    nonce: keyBundle.nonce,
                }
            );

            if (result.success) {
                setIsNewFolderOpen(false);
                resetForm();
                toast.success('Folder created!');
                queryClient.setQueryData<DriveList>([queryKey], queryData => {
                    if (!queryData) {
                        return undefined;
                    }

                    const folders: FolderNodeDecrypted[] = [
                        ...queryData.folders,
                        {
                            id: result.data.id,
                            key: keyBundle.folderKeyB64,
                            metadata,
                            isShared: false,
                        },
                    ];

                    return {
                        ...queryData,
                        folders,
                    };
                });
                return null;
            }

            toast.error('Folder creation failed!');

            addServerErrors(result.errors, setError, Object.keys(data));
        },
        {
            onError() {
                toast.error('Folder creation failed!');
            },
        }
    );

    return (
        <Dialog.Root
            open={isNewFolderOpen}
            onOpenChange={value => {
                resetForm();
                setIsNewFolderOpen(value);
            }}>
            <Dialog.Portal>
                <Dialog.Overlay className='fixed inset-0 bg-gray-700/50 data-[state=open]:animate-overlayShow' />
                <Dialog.Content className='fixed left-1/2 top-1/2 max-h-[85vh] w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-6 shadow focus:outline-none data-[state=open]:animate-contentShow'>
                    <div className='flex items-center justify-between'>
                        <Dialog.Title className='m-0 text-[17px] font-medium text-gray-950'>
                            Create New Folder
                        </Dialog.Title>
                        <Dialog.Close asChild>
                            <button
                                type='button'
                                className='inline-flex h-6 w-6 items-center justify-center rounded-full text-brand-600 focus:outline-none'
                                aria-label='Close'>
                                <X />
                            </button>
                        </Dialog.Close>
                    </div>
                    <form
                        className='mt-4 space-y-2'
                        onSubmit={handleSubmit(data => mutation.mutateAsync(data))}>
                        <small className='text-red-600'>{errors.errors?.message}</small>

                        <InputWithLabel
                            error={errors.folderName}
                            type='text'
                            id='folderName'
                            autoComplete='folderName'
                            {...register('folderName')}
                            autoFocus>
                            Folder Name
                        </InputWithLabel>

                        <button
                            type='submit'
                            disabled={mutation.isLoading}
                            className={cn(
                                'flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg py-1.5 font-medium',
                                'disabled:cursor-not-allowed disabled:bg-brand-600/80',
                                'bg-brand-600 text-white focus-visible:ring-brand-600/75'
                            )}>
                            <span>Create</span>
                            <Loader
                                size={16}
                                className={cn('animate-spin', !mutation.isLoading && 'hidden')}
                            />
                        </button>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
