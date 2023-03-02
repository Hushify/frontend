import PQueue from 'p-queue';
import { FileWithPath } from 'react-dropzone';
import { create } from 'zustand';

import CryptoWorker from '@/lib/services/comlink-crypto';
import { UploadService } from '@/lib/services/upload';
import { useAuthStore } from '@/lib/stores/auth-store';

const uploadQueue = new PQueue({
    concurrency: 5,
});

export type FileUploadState =
    | 'Pending'
    | 'Uploading'
    | 'Uploaded'
    | 'Failed'
    | 'Cancelled'; // TODO: Add support for pausing?

export type FileWithVersion = {
    file: FileWithPath;
    previousVersionId?: string;
};

export type FileWithState = {
    abortController: AbortController;
    fileWithVersion: FileWithVersion;
    trackingId: string;
    state: FileUploadState;
    progress: number;
    uploaded: number;
    error?: string;
    id?: string;
    parentFolderId: string;
    fileKey?: string;
    currentFolderKey: string;
    onUploadCb: () => void;
};

type valueof<T> = T[keyof T];

export type UploadState = {
    files: FileWithState[];
};

export type UploadActions = {
    queueForUpload: (
        // folderMap: Map<string, string | null>,
        files: FileWithVersion[],
        parentFolderId: string,
        currentFolderKey: string,
        accessToken: string,
        onUploadCb: () => void
    ) => void;

    setFileProperty: (
        trackingId: string,
        key: keyof Omit<FileWithState, 'file'>,
        value: valueof<Omit<FileWithState, 'file'>>
    ) => void;

    retry: (trackingId: string) => void;

    removeFile: (trackingId: string) => void;

    clear: () => void;

    clearAll: () => void;
};

const initialState: UploadState = {
    files: [],
};

export const useUploadStore = create<UploadState & UploadActions>()(
    (set, get) => ({
        ...initialState,

        queueForUpload: async (
            // folderMap: Map<string, string | null>,
            files: FileWithVersion[],
            parentFolderId: string,
            currentFolderKey: string,
            accessToken: string,
            onUploadCb: () => void
        ) => {
            const worker = CryptoWorker.cryptoWorker;

            const filesToAdd: FileWithState[] = files.map(
                file =>
                    ({
                        abortController: new AbortController(),
                        fileWithVersion: file,
                        trackingId: crypto.randomUUID(),
                        state: 'Pending',
                        progress: 0,
                        uploaded: 0,
                        parentFolderId,
                        currentFolderKey,
                        onUploadCb,
                    } as FileWithState)
            );

            set({
                files: [...filesToAdd, ...get().files],
            });

            for (const file of filesToAdd.filter(f => f.state === 'Pending')) {
                uploadQueue.add(async () => {
                    get().setFileProperty(
                        file.trackingId,
                        'state',
                        'Uploading'
                    );
                    try {
                        const resp =
                            await UploadService.prepareFileForMultipartUpload(
                                file.abortController.signal,
                                parentFolderId,
                                file.fileWithVersion.file.name,
                                file.fileWithVersion.previousVersionId,
                                file.fileWithVersion.file.type,
                                file.fileWithVersion.file.size,
                                accessToken,
                                currentFolderKey
                            );

                        await UploadService.uploadMultipart(
                            file.abortController.signal,
                            file.fileWithVersion.file,
                            resp.fileKey,
                            accessToken,
                            resp.data.fileId,
                            resp.data.parts,
                            (uploaded: number) => {
                                const currentFile = get().files.find(
                                    f => f.trackingId === file.trackingId
                                );
                                if (!currentFile) {
                                    return;
                                }
                                get().setFileProperty(
                                    file.trackingId,
                                    'progress',
                                    Math.min(
                                        ((currentFile.uploaded + uploaded) *
                                            100) /
                                            file.fileWithVersion.file.size,
                                        100
                                    )
                                );
                                get().setFileProperty(
                                    file.trackingId,
                                    'uploaded',
                                    uploaded
                                );
                            }
                        );

                        get().setFileProperty(
                            file.trackingId,
                            'state',
                            'Uploaded'
                        );

                        get().setFileProperty(file.trackingId, 'progress', 100);

                        onUploadCb();
                    } catch (error) {
                        get().setFileProperty(
                            file.trackingId,
                            'state',
                            'Failed'
                        );
                        get().setFileProperty(
                            file.trackingId,
                            'error',
                            typeof error === 'string'
                                ? error
                                : (error as Error).message
                        );
                    }
                });
            }
        },

        setFileProperty: (
            trackingId: string,
            key: keyof Omit<FileWithState, 'file'>,
            value: valueof<Omit<FileWithState, 'file'>>
        ) =>
            set(current => ({
                files: current.files.map(f => {
                    if (f.trackingId !== trackingId) {
                        return f;
                    }

                    // @ts-ignore
                    f[key] = value;
                    return f;
                }),
            })),

        retry: (trackingId: string) => {
            const currentFile = get().files.find(
                f => f.trackingId === trackingId
            );

            if (
                !currentFile ||
                currentFile.state !== ('Cancelled' || 'Failed')
            ) {
                return;
            }

            get().queueForUpload(
                [currentFile.fileWithVersion],
                currentFile.parentFolderId,
                currentFile.currentFolderKey,
                // eslint-disable-next-line react-hooks/rules-of-hooks
                useAuthStore().accessToken ?? '',
                currentFile.onUploadCb
            );

            return set(current => ({
                files: current.files.filter(f => f.trackingId !== trackingId),
            }));
        },

        removeFile: (trackingId: string) => {
            const currentFile = get().files.find(
                f => f.trackingId === trackingId
            );

            if (currentFile && currentFile.state === 'Uploading') {
                currentFile.abortController.abort('User cancelled upload.');
                currentFile.state = 'Cancelled';
            }

            return set(current => ({
                files: current.files.filter(f => f.trackingId !== trackingId),
            }));
        },

        clear: () => {
            set({
                files: get().files.filter(
                    f =>
                        f.state !== 'Uploaded' &&
                        f.state !== 'Cancelled' &&
                        f.state !== 'Failed'
                ),
            });
        },

        clearAll: () => {
            uploadQueue.clear();
            set({ files: [] });
        },
    })
);
