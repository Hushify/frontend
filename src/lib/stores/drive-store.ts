import { apiRoutes } from '@/data/routes';
import PQueue from 'p-queue';
import { FileWithPath } from 'react-dropzone';
import { create } from 'zustand';

const uploadQueue = new PQueue({
    concurrency: 5,
});

type FileUploadStatus =
    | 'Pending'
    | 'Initializing'
    | 'Uploading'
    | 'Uploaded'
    | 'Failed'
    | 'Cancelled';

type FileWithState = {
    id: string;
    status: FileUploadStatus;
    file: FileWithPath;
    fileId?: string;
    contentType?: string;
    url?: string;
    parentFolderId?: string;
    progress?: number;
    error?: string;
    abortController: AbortController;
};

type DriveStoreState = {
    filesWithState: FileWithState[];
    queueFilesForUpload: (
        accessToken: string,
        files: FileWithPath[],
        onComplete: () => void,
        parentFolderId?: string
    ) => void;
    setFileProperty: <T extends keyof FileWithState>(
        fileId: string,
        key: T,
        value: FileWithState[T]
    ) => void;
    removeFile: (fileId: string) => void;
    clearAll: () => void;
};

const useDriveStore = create<DriveStoreState>()((set, get) => ({
    filesWithState: [],
    queueFilesForUpload: async (
        accessToken,
        files,
        onComplete,
        parentFolderId
    ) => {
        const filesWithState: FileWithState[] = files.map(file => ({
            id: crypto.randomUUID(),
            file,
            status: 'Pending',
            parentFolderId,
            abortController: new AbortController(),
        }));

        set(current => ({
            filesWithState: [...filesWithState, ...current.filesWithState],
        }));

        filesWithState
            .filter(f => f.status === 'Pending')
            .map(fileWithState =>
                uploadQueue.add(
                    async ({ signal }) => {
                        const { setFileProperty } = get();

                        const onAbort = async () => {
                            setFileProperty(
                                fileWithState.id,
                                'status',
                                'Cancelled'
                            );

                            if (fileWithState.fileId) {
                                await changeUploadStatusAsync(
                                    apiRoutes.drive.uploadCancelled,
                                    fileWithState.fileId,
                                    accessToken
                                );
                            }

                            onComplete();
                        };

                        signal?.addEventListener('abort', onAbort);

                        setFileProperty(
                            fileWithState.id,
                            'status',
                            'Initializing'
                        );

                        const response = await startUploadAsync(
                            accessToken,
                            signal,
                            fileWithState,
                            parentFolderId
                        );

                        if (response.error) {
                            setFileProperty(
                                fileWithState.id,
                                'status',
                                'Failed'
                            );
                            setFileProperty(
                                fileWithState.id,
                                'error',
                                response.error.message
                            );
                            signal?.removeEventListener('abort', onAbort);
                            return;
                        }

                        setFileProperty(
                            fileWithState.id,
                            'status',
                            'Uploading'
                        );
                        setFileProperty(
                            fileWithState.id,
                            'fileId',
                            response.data.fileId
                        );
                        setFileProperty(
                            fileWithState.id,
                            'url',
                            response.data.url
                        );
                        setFileProperty(
                            fileWithState.id,
                            'contentType',
                            response.data.contentType
                        );

                        if (
                            !fileWithState.contentType ||
                            !fileWithState.url ||
                            !fileWithState.fileId
                        ) {
                            return;
                        }

                        try {
                            const onProgress = (progress: number) => {
                                setFileProperty(id, 'progress', progress);
                            };

                            await uploadFileToS3Async(
                                fileWithState.file,
                                fileWithState.contentType,
                                fileWithState.url,
                                onProgress,
                                signal
                            );
                        } catch (error) {
                            if (error === 'ABORT') {
                                setFileProperty(
                                    fileWithState.id,
                                    'status',
                                    'Cancelled'
                                );
                            } else {
                                setFileProperty(
                                    fileWithState.id,
                                    'status',
                                    'Failed'
                                );
                                setFileProperty(
                                    fileWithState.id,
                                    'error',
                                    'Upload Failed'
                                );
                            }

                            await changeUploadStatusAsync(
                                routes.api.drive.uploadFailed,
                                fileWithState.fileId,
                                accessToken
                            );

                            onComplete();

                            signal?.removeEventListener('abort', onAbort);
                            return;
                        }

                        try {
                            await changeUploadStatusAsync(
                                apiRoutes.drive.uploadFinished,
                                fileWithState.fileId,
                                accessToken,
                                signal
                            );
                        } catch {
                            /* empty */
                        }

                        setFileProperty(fileWithState.id, 'status', 'Uploaded');
                        onComplete();
                        signal?.removeEventListener('abort', onAbort);
                    },
                    { signal: fileWithState.abortController.signal }
                )
            );
    },
    setFileProperty: (fileId, key, value) =>
        set(current => ({
            filesWithState: current.filesWithState.map(f => {
                if (f.id !== fileId) {
                    return f;
                }

                f[key] = value;
                return f;
            }),
        })),
    removeFile: (fileId: string) =>
        set(current => ({
            filesWithState: current.filesWithState.filter(f => f.id !== fileId),
        })),
    clearAll: () => {
        uploadQueue.clear();
        set({ filesWithState: [] });
    },
}));

export default useDriveStore;

const startUploadAsync = async (
    accessToken: string,
    signal: AbortSignal | null | undefined,
    fileWithState: FileWithState,
    parentFolderId?: string
) => {
    const response = await fetch(apiRoutes.drive.startUpload, {
        method: 'POST',
        body: JSON.stringify({
            fileName: decodeURIComponent(
                fileWithState.file.path ??
                    fileWithState.file.webkitRelativePath ??
                    fileWithState.file.name
            ),
            size: fileWithState.file.size,
            parentFolderId,
        }),
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        signal,
    });

    if (response.status === 200) {
        return {
            data: (await response.json()) as {
                fileId: string;
                url: string;
                contentType: string;
            },
        };
    }

    return {
        error: (await response.json()) as {
            message: string;
        },
    };
};

const uploadFileToS3Async = (
    file: FileWithPath,
    contentType: string,
    signedUrl: string,
    onProgress: (progress: number) => void,
    abortSignal?: AbortSignal
) =>
    new Promise((res, rej) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', signedUrl, true);
        xhr.setRequestHeader('Content-Type', contentType);

        const onProgressEvt = (evt: ProgressEvent<EventTarget>) => {
            if (evt.lengthComputable) {
                const progress = (evt.loaded * 100) / evt.total;
                onProgress(Math.round(progress));
            }
        };

        const onLoad = () => {
            removeUploadEventListeners();
            res('DONE');
        };

        const onAbort = (e: any) => {
            removeUploadEventListeners();
            xhr.abort();
            rej(new Error('ABORT'));
        };

        const onError = (e: any) => {
            removeUploadEventListeners();
            xhr.abort();
            rej(new Error('ERROR'));
        };

        const removeUploadEventListeners = () => {
            xhr.upload.removeEventListener('load', onLoad);
            xhr.upload.removeEventListener('progress', onProgressEvt);

            xhr.upload.removeEventListener('error', onError);
            xhr.upload.removeEventListener('abort', onAbort);
            abortSignal?.removeEventListener('abort', onAbort);
        };

        xhr.upload.addEventListener('load', onLoad);
        xhr.upload.addEventListener('progress', onProgressEvt);

        xhr.upload.addEventListener('error', onError);
        xhr.upload.addEventListener('abort', onAbort);
        abortSignal?.addEventListener('abort', onAbort);

        xhr.send(file);
    });

const changeUploadStatusAsync = async (
    route: string,
    fileId: string,
    accessToken: string,
    abortSignal?: AbortSignal
) => {
    await fetch(`${route}?fileId=${fileId}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        signal: abortSignal,
    });
};
