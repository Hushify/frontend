import { proxy } from 'comlink';
import PQueue from 'p-queue';
import { FileWithPath } from 'react-dropzone';
import { create } from 'zustand';

import CryptoWorker from '@/lib/services/comlink-crypto';
import UploadWorker from '@/lib/services/comlink-wrappers/comlink-uploader';

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
    fileWithVersion: FileWithVersion;
    trackingId: string;
    state: FileUploadState;
    progress: number;
    error?: string;
    id?: string;
    parentFolderId: string;
    fileKey?: string;
    currentFolderKey: string;
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
                f =>
                    ({
                        fileWithVersion: f,
                        trackingId: crypto.randomUUID(),
                        state: 'Pending',
                        progress: 0,
                        parentFolderId,
                        currentFolderKey,
                    } as FileWithState)
            );

            set({
                files: [...filesToAdd, ...get().files],
            });

            const uploadWorker = UploadWorker.instance;

            for (const file of filesToAdd.filter(f => f.state === 'Pending')) {
                uploadQueue.add(async () => {
                    get().setFileProperty(
                        file.trackingId,
                        'state',
                        'Uploading'
                    );
                    try {
                        const resp =
                            await uploadWorker.prepareFileForMultipartUpload(
                                parentFolderId,
                                file.fileWithVersion.file.name,
                                file.fileWithVersion.previousVersionId,
                                file.fileWithVersion.file.type,
                                file.fileWithVersion.file.size,
                                accessToken,
                                currentFolderKey
                            );

                        await uploadWorker.uploadMultipart(
                            file.fileWithVersion.file,
                            resp.fileKey,
                            accessToken,
                            resp.data.fileId,
                            resp.data.parts,
                            proxy(() => {
                                get().setFileProperty(
                                    file.trackingId,
                                    'progress',
                                    Math.min(
                                        file.progress +
                                            file.progress /
                                                resp.data.parts.length,
                                        100
                                    )
                                );
                            })
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

        removeFile: (trackingId: string) =>
            set(current => ({
                files: current.files.filter(f => f.trackingId !== trackingId),
            })),

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
