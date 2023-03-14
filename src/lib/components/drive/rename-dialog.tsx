import { Dispatch, SetStateAction, useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Dialog from '@radix-ui/react-dialog';
import { useQueryClient } from '@tanstack/react-query';
import { Loader, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import sanitize from 'sanitize-filename';
import zod from 'zod';

import { InputWithLabel } from '@/lib/components/input-with-label';
import { apiRoutes } from '@/lib/data/routes';
import { useFormMutation } from '@/lib/hooks/use-form-mutation';
import CryptoWorker from '@/lib/services/comlink-crypto';
import {
    DriveList,
    FileNodeDecrypted,
    FolderNodeDecrypted,
    updateMetadata,
} from '@/lib/services/drive';
import { useAuthStore } from '@/lib/stores/auth-store';
import { addServerErrors } from '@/lib/utils/addServerErrors';
import { cn } from '@/lib/utils/cn';

type RenameInputs = {
    errors: string;
    name: string;
};

const renameSchema = zod
    .object({
        name: zod
            .string()
            .trim()
            .min(1, 'Name is required.')
            .refine(name => sanitize(name) === name, 'Name is not valid.'),
    })
    .required();

export function RenameDialog({
    node,
    nodes,
    currentFolderId,
    isRenameOpen,
    setIsRenameOpen,
    type,
    onSuccess,
}: {
    node: FolderNodeDecrypted | FileNodeDecrypted;
    nodes: undefined | FolderNodeDecrypted[] | FileNodeDecrypted[];
    currentFolderId: string | null;
    isRenameOpen: boolean;
    setIsRenameOpen: Dispatch<SetStateAction<boolean>>;
    type: 'folder' | 'file';
    onSuccess: () => void;
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
    } = useForm<RenameInputs>({
        resolver: zodResolver(renameSchema),
        defaultValues: {
            name: node.metadata.name,
        },
    });

    const resetForm = useCallback(() => {
        resetField('name');
        resetField('errors');
        clearErrors();
    }, [clearErrors, resetField]);

    const onSubmit = useCallback(
        async (data: RenameInputs) => {
            if (node.metadata.name === data.name) {
                addServerErrors(
                    {
                        name: [`The ${type} name can not be same.`],
                    },
                    setError,
                    Object.keys(data)
                );
                throw new Error('Rename failed!');
                return null;
            }

            if (
                nodes &&
                nodes.findIndex(f => f.metadata.name === data.name) !== -1
            ) {
                addServerErrors(
                    {
                        name: [`A ${type} with that name already exists.`],
                    },
                    setError,
                    Object.keys(data)
                );
                throw new Error('Rename failed!');
            }

            const crypto = CryptoWorker.instance;

            node.metadata.name = data.name;
            node.metadata.modified = new Date().toUTCString();

            let key = null;
            if (type === 'file') {
                key = (node as FileNodeDecrypted).key;
            } else {
                key = (node as FolderNodeDecrypted).key;
            }

            const metadataBundle = await crypto.encryptMetadata(
                key,
                node.metadata
            );

            const result = await updateMetadata(
                accessToken,
                node.id,
                type,
                metadataBundle
            );

            if (result.success) {
                queryClient.setQueryData<DriveList>([queryKey], queryData => {
                    if (!queryData) {
                        return undefined;
                    }

                    if (type === 'file') {
                        const files: FileNodeDecrypted[] = [
                            ...queryData.files.filter(f => f.id !== node.id),
                            node as FileNodeDecrypted,
                        ];

                        return {
                            ...queryData,
                            files,
                        };
                    }

                    const folders: FolderNodeDecrypted[] = [
                        ...queryData.folders.filter(f => f.id !== node.id),
                        node as FolderNodeDecrypted,
                    ];

                    return {
                        ...queryData,
                        folders,
                    };
                });
                setIsRenameOpen(false);
                resetForm();
                onSuccess();
                return null;
            }

            addServerErrors(result.errors, setError, Object.keys(data));
            throw new Error('Rename failed!');
        },
        [
            node,
            nodes,
            type,
            accessToken,
            setError,
            queryClient,
            queryKey,
            setIsRenameOpen,
            resetForm,
            onSuccess,
        ]
    );

    const mutation = useFormMutation(async (data: RenameInputs) => {
        await toast.promise(onSubmit(data), {
            loading: 'Renaming...',
            success: `${type === 'file' ? 'File' : 'Folder'} renamed!`,
            error: 'Rename failed!',
        });
    }, setError);

    return (
        <Dialog.Root
            open={isRenameOpen}
            onOpenChange={value => {
                resetForm();
                setIsRenameOpen(value);
            }}>
            <Dialog.Portal>
                <Dialog.Overlay className='fixed inset-0 bg-gray-700/50 data-[state=open]:animate-overlayShow' />
                <Dialog.Content className='fixed top-1/2 left-1/2 max-h-[85vh] w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-6 shadow focus:outline-none data-[state=open]:animate-contentShow'>
                    <div className='flex items-center justify-between'>
                        <Dialog.Title className='m-0 text-[17px] font-medium text-gray-900'>
                            Rename {type}
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
                        onSubmit={handleSubmit(data =>
                            mutation.mutateAsync(data)
                        )}>
                        <small className='text-red-600'>
                            {errors.errors?.message}
                        </small>

                        <InputWithLabel
                            error={errors.name}
                            type='text'
                            id='name'
                            autoComplete='name'
                            {...register('name')}
                            autoFocus>
                            New Name
                        </InputWithLabel>

                        <button
                            type='submit'
                            disabled={mutation.isLoading}
                            className={cn(
                                'flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg py-1.5 font-medium',
                                'disabled:cursor-not-allowed disabled:bg-brand-600/80',
                                'bg-brand-600 text-white focus-visible:ring-brand-600/75'
                            )}>
                            <span>Rename</span>
                            <Loader
                                size={16}
                                className={cn(
                                    'animate-spin',
                                    !mutation.isLoading && 'hidden'
                                )}
                            />
                        </button>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
