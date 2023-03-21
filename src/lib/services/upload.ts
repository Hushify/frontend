import {
    AMZ_MIN_CHUNK_SIZE,
    AUTH_SIZE,
    DEFAULT_CHUNK_SIZE,
    HEADER_SIZE,
} from '@/lib/constants/encryption';
import { apiRoutes } from '@/lib/data/routes';
import CryptoWorker from '@/lib/services/comlink-crypto';

export function getEncryptedSize(fileSize: number) {
    const numberOfChunks = fileSize / DEFAULT_CHUNK_SIZE;

    const encryptedChunkSize = DEFAULT_CHUNK_SIZE + AUTH_SIZE;

    const encryptedSize = numberOfChunks * encryptedChunkSize + HEADER_SIZE;

    return Math.ceil(encryptedSize);
}

export const UploadService = {
    prepareFileForMultipartUpload: async (
        signal: AbortSignal,
        parentFolderId: string,
        name: string,
        previousVersionId: string | undefined,
        mimeType: string,
        fileSize: number,
        accessToken: string,
        currentFolderKey: string
    ) => {
        const encryptedSize = getEncryptedSize(fileSize);

        const numberOfEncryptedChunks = Math.ceil(
            encryptedSize / AMZ_MIN_CHUNK_SIZE
        );

        const cryptoWorker = CryptoWorker.instance;
        const { fileKey, fileKeyB64, encryptedFileKey, nonce } =
            await cryptoWorker.generateFileKey(currentFolderKey);

        const created = new Date().toISOString();
        const modified = new Date().toISOString();

        const encryptedMetadataBundle = await cryptoWorker.encryptMetadata(
            fileKey,
            { name, size: fileSize, created, modified, mimeType }
        );

        const response = await fetch(apiRoutes.drive.multipart.create, {
            method: 'POST',
            body: JSON.stringify({
                parentFolderId,
                previousVersionId,
                numberOfChunks: numberOfEncryptedChunks,
                encryptedSize,
                keyBundle: {
                    nonce,
                    encryptedKey: encryptedFileKey,
                },
                metadataBundle: encryptedMetadataBundle,
            }),
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            signal,
        });

        if (!response.ok) {
            throw new Error('Failed to create multipart upload.');
        }

        const data = (await response.json()) as {
            fileId: string;
            uploadId: string;
            parts: { partNumber: number; preSignedUrl: string }[];
        };

        return { data, fileKey: fileKeyB64 };
    },

    uploadMultipart: async (
        signal: AbortSignal,
        file: File,
        fileKey: string,
        accessToken: string,
        fileId: string,
        parts: { partNumber: number; preSignedUrl: string }[],
        onProgress: (uploaded: number) => void
    ) => {
        const cryptoWorker = CryptoWorker.instance;
        const { state, header } = await cryptoWorker.streamingEncryptionInit(
            fileKey
        );

        const eTags: { eTag: string; partNumber: number }[] = [];

        for (let i = 0; i < parts.length; i++) {
            try {
                const part = parts[i];
                let amzChunk: Uint8Array | null = i === 0 ? header : null;

                for (
                    let j = AMZ_MIN_CHUNK_SIZE * i;
                    j < AMZ_MIN_CHUNK_SIZE * (i + 1);
                    j += DEFAULT_CHUNK_SIZE
                ) {
                    if (signal.aborted) {
                        throw new Error('Upload aborted.');
                    }

                    const chunk = file.slice(j, j + DEFAULT_CHUNK_SIZE);

                    if (chunk.size === 0) {
                        break;
                    }

                    const chunkArrayBuffer = await chunk.arrayBuffer();
                    const encryptedChunk =
                        await cryptoWorker.streamingEncryptionPush(
                            state,
                            new Uint8Array(chunkArrayBuffer),
                            i + 1 === parts.length &&
                                chunk.size < DEFAULT_CHUNK_SIZE
                        );

                    if (amzChunk === null) {
                        amzChunk = encryptedChunk;
                    } else {
                        amzChunk = new Uint8Array([
                            ...amzChunk,
                            ...encryptedChunk,
                        ]);
                    }

                    onProgress(chunk.size);
                }

                if (amzChunk === null) {
                    throw new Error('Encryption failed.');
                }

                const response = await fetch(part.preSignedUrl, {
                    method: 'PUT',
                    body: amzChunk,
                    headers: {
                        'Content-Type': 'application/octet-stream',
                    },
                    signal,
                });

                if (!response.ok) {
                    throw new Error('Upload failed');
                }

                if (!response.headers.has('etag')) {
                    throw new Error('Missing eTag');
                }

                eTags.push({
                    eTag: response.headers.get('etag')!.replace(/"/g, ''),
                    partNumber: part.partNumber,
                });
            } catch (error) {
                console.log(error);
                throw error;
            }
        }

        const response = await fetch(
            `${apiRoutes.drive.multipart.commit}/${fileId}`,
            {
                method: 'POST',
                body: JSON.stringify({
                    parts: eTags,
                }),
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                signal,
            }
        );

        if (!response.ok) {
            throw new Error('Failed to commit multipart upload.');
        }
    },

    cancelMultipart: async (fileId: string, accessToken: string) => {
        await fetch(`${apiRoutes.drive.multipart.cancel}/${fileId}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });
    },

    checkCompat: async () => {
        try {
            const key = CryptoWorker.instance.generateRandomKeyForCompat();
            if (!key) {
                return false;
            }

            return true;
        } catch {
            return false;
        }
    },
};
