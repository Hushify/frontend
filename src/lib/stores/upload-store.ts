import PQueue from 'p-queue';
import { FileWithPath } from 'react-dropzone';
import { create } from 'zustand';

import { UploadWorkerInstance } from '@/lib/services/comlink-uploader';
import { UploadService } from '@/lib/services/upload';

const UploaderInstance = UploadWorkerInstance.checkCompat().then(isCompat => {
    if (isCompat) {
        return UploadWorkerInstance;
    } else {
        return UploadService;
    }
});

const uploadQueue = new PQueue({
    concurrency: 5,
});

export type FileUploadState = 'Pending' | 'Uploading' | 'Uploaded' | 'Failed' | 'Cancelled'; // TODO: Add support for pausing?

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
        files: FileWithVersion[],
        parentFolderId: string,
        currentFolderKey: string,
        accessToken: string,
        onUploadCb: () => void
    ) => Promise<void>;

    setFileProperty: (
        trackingId: string,
        key: keyof Omit<FileWithState, 'file'>,
        value: valueof<Omit<FileWithState, 'file'>>
    ) => void;

    retry: (trackingId: string, accessToken: string) => void;

    removeFile: (trackingId: string) => void;

    clear: () => void;

    clearAll: () => void;
};

const initialState: UploadState = {
    files: [],
};

export const useUploadStore = create<UploadState & UploadActions>((set, get) => ({
    ...initialState,

    queueForUpload: async (
        files: FileWithVersion[],
        parentFolderId: string,
        currentFolderKey: string,
        accessToken: string,
        onUploadCb: () => void
    ) => {
        const Uploader = await UploaderInstance;

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

        set({ files: [...filesToAdd, ...get().files] });

        const { setFileProperty } = get();

        for (const file of filesToAdd.filter(f => f.state === 'Pending')) {
            uploadQueue.add(async () => {
                setFileProperty(file.trackingId, 'state', 'Uploading');
                try {
                    const resp = await Uploader.prepareFileForMultipartUpload(
                        file.abortController.signal,
                        parentFolderId,
                        file.fileWithVersion.file.name,
                        file.fileWithVersion.previousVersionId,
                        file.fileWithVersion.file.type,
                        file.fileWithVersion.file.size,
                        accessToken,
                        currentFolderKey
                    );

                    file.id = resp.data.fileId;

                    const onProgress = (uploaded: number) => {
                        const currentFile = get().files.find(f => f.trackingId === file.trackingId);

                        if (!currentFile) {
                            return;
                        }

                        setFileProperty(
                            file.trackingId,
                            'progress',
                            Math.min(
                                ((currentFile.uploaded + uploaded) * 100) /
                                    currentFile.fileWithVersion.file.size,
                                100
                            )
                        );

                        setFileProperty(
                            file.trackingId,
                            'uploaded',
                            currentFile.uploaded + uploaded
                        );
                    };

                    await UploadService.uploadMultipart(
                        file.abortController.signal,
                        file.fileWithVersion.file,
                        resp.fileKey,
                        accessToken,
                        resp.data.fileId,
                        resp.data.parts,
                        // proxy(onProgress)
                        onProgress
                    );

                    setFileProperty(file.trackingId, 'state', 'Uploaded');
                    setFileProperty(file.trackingId, 'progress', 100);
                    onUploadCb();
                } catch (error) {
                    console.error(error);
                    setFileProperty(file.trackingId, 'state', 'Failed');
                    setFileProperty(
                        file.trackingId,
                        'error',
                        typeof error === 'string' ? error : (error as Error).message
                    );
                    if (file.id) {
                        await UploadService.cancelMultipart(file.id, accessToken);
                    }
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
            files: current.files.map((file: FileWithState) => {
                if (file.trackingId !== trackingId) {
                    return file;
                }

                // @ts-ignore
                file[key] = value;
                return file;
            }),
        })),

    retry: (trackingId: string, accessToken: string) => {
        const currentFile = get().files.find(f => f.trackingId === trackingId);

        if (!currentFile || (currentFile.state !== 'Cancelled' && currentFile.state !== 'Failed')) {
            return;
        }

        get().queueForUpload(
            [currentFile.fileWithVersion],
            currentFile.parentFolderId,
            currentFile.currentFolderKey,
            accessToken,
            currentFile.onUploadCb
        );

        set(current => ({
            files: current.files.filter(f => f.trackingId !== trackingId),
        }));
    },

    removeFile: (trackingId: string) => {
        const currentFile = get().files.find(f => f.trackingId === trackingId);

        if (currentFile && currentFile.state === 'Uploading') {
            currentFile.abortController.abort('User cancelled upload.');
            currentFile.state = 'Cancelled';
            return;
        }

        set(current => ({
            files: current.files.filter(f => f.trackingId !== trackingId),
        }));
    },

    clear: () => {
        set({
            files: get().files.filter(
                f => f.state !== 'Uploaded' && f.state !== 'Cancelled' && f.state !== 'Failed'
            ),
        });
    },

    clearAll: () => {
        uploadQueue.clear();
        set({ files: [] });
    },
}));
