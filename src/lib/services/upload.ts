import axios from 'axios';

import { apiRoutes } from '@/lib/data/routes';
import CryptoWorker from '@/lib/services/comlink-crypto';

export const HEADER_SIZE = 24;
export const AUTH_SIZE = 17;

export const AMZ_MIN_CHUNK_SIZE = 5 * 1024 * 1024;
export const DEFAULT_CHUNK_SIZE = 64 * 1024;
export const ENCRYPTED_CHUNK_SIZE = DEFAULT_CHUNK_SIZE + AUTH_SIZE;

export function getEncryptedSize(fileSize: number) {
    const numberOfChunks = fileSize / DEFAULT_CHUNK_SIZE;

    const encryptedChunkSize = DEFAULT_CHUNK_SIZE + AUTH_SIZE;

    const encryptedSize = numberOfChunks * encryptedChunkSize + HEADER_SIZE;

    return Math.ceil(encryptedSize);
}

export const UploadService = {
    prepareFileForMultipartUpload: async (
        // signal: AbortSignal,
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

        const cryptoWorker = CryptoWorker.cryptoWorker;
        const { fileKey, fileKeyB64, encFileKey, nonce } =
            await cryptoWorker.generateFileKey(currentFolderKey);

        const created = new Date().toUTCString();
        const modified = new Date().toUTCString();

        const encryptedMetadataBundle = await cryptoWorker.encryptMetadata(
            fileKey,
            { name, size: fileSize, created, modified, mimeType }
        );

        const { data } = (await axios.post(
            apiRoutes.drive.multipart.create,
            {
                parentFolderId,
                previousVersionId,
                numberOfChunks: numberOfEncryptedChunks,
                encryptedSize,
                fileKeyBundle: {
                    nonce,
                    encKey: encFileKey,
                },
                metadataBundle: {
                    nonce: encryptedMetadataBundle.nonce,
                    metadata: encryptedMetadataBundle.encMetadata,
                },
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                // signal,
            }
        )) as {
            data: {
                fileId: string;
                uploadId: string;
                parts: { partNumber: number; preSignedUrl: string }[];
            };
        };

        return { data, fileKey: fileKeyB64 };
    },

    uploadMultipart: async (
        // signal: AbortSignal,
        file: File,
        fileKey: string,
        accessToken: string,
        fileId: string,
        parts: { partNumber: number; preSignedUrl: string }[],
        onProgress: (uploaded: number) => void
    ) => {
        const cryptoWorker = CryptoWorker.cryptoWorker;
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

                const { headers, status } = await axios.put(
                    part.preSignedUrl,
                    amzChunk,
                    {
                        headers: {
                            'Content-Type': 'application/octet-stream',
                        },
                        // signal,
                    }
                );

                if (status !== 200) {
                    throw new Error('Upload failed');
                }

                if (!headers.etag) {
                    throw new Error('Missing eTag');
                }

                eTags.push({
                    eTag: headers.etag.replace(/"/g, ''),
                    partNumber: part.partNumber,
                });
            } catch (error) {
                console.log(error);
                throw error;
            }
        }

        await axios.post(
            `${apiRoutes.drive.multipart.commit}/${fileId}`,
            {
                parts: eTags,
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );
    },

    uploadMultipartDbg: async (
        file: File,
        fileKey: string,
        accessToken: string,
        fileId: string,
        parts: { partNumber: number; preSignedUrl: string }[],
        onProgress: (uploaded: number) => void
    ) => {
        const cryptoWorker = CryptoWorker.cryptoWorker;
        const { state, header } = await cryptoWorker.streamingEncryptionInit(
            fileKey
        );

        const dstate = await cryptoWorker.streamingDecryptionInit(
            header,
            fileKey
        );

        const eTags: { eTag: string; partNumber: number }[] = [];

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            let amzChunk: Uint8Array | null = i === 0 ? header : null;

            for (
                let j = AMZ_MIN_CHUNK_SIZE * i;
                j < AMZ_MIN_CHUNK_SIZE * (i + 1);
                j += DEFAULT_CHUNK_SIZE
            ) {
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
                    amzChunk = new Uint8Array([...amzChunk, ...encryptedChunk]);
                }

                onProgress(chunk.size);
            }

            if (amzChunk === null) {
                throw new Error('Encryption failed.');
            }

            if (i === 0) {
                for (
                    let index = 0;
                    index < AMZ_MIN_CHUNK_SIZE / (64 * 1024);
                    index++
                ) {
                    const { message, tag } =
                        await cryptoWorker.streamingDecryptionPull(
                            dstate,
                            amzChunk.slice(
                                24 + (64 * 1024 + 17) * index,
                                24 + (64 * 1024 + 17) * (index + 1)
                            )
                        );

                    console.log({ message, tag });
                }
            }

            if (i === 1) {
                const { message, tag } =
                    await cryptoWorker.streamingDecryptionPull(
                        dstate,
                        amzChunk.slice(0, 64 * 1024 + 17)
                    );

                console.log({ message, tag });
            }

            // if (i === 1) {
            //     for (let index = 0; index < 4; index++) {
            //         console.log(
            //             amzChunk.slice(
            //                 (64 * 1024 + 17) * index,
            //                 (64 * 1024 + 17) * (index + 1)
            //             )
            //         );

            //         const { message, tag } =
            //             await cryptoWorker.streamingDecryptionPull(
            //                 dstate,
            //                 amzChunk.slice(
            //                     (64 * 1024 + 17) * index,
            //                     (64 * 1024 + 17) * (index + 1)
            //                 )
            //             );

            //         console.log({ message, tag });
            //     }
            // }

            const { headers, status } = await axios.put(
                part.preSignedUrl,
                amzChunk,
                {
                    headers: {
                        'Content-Type': 'application/octet-stream',
                    },
                }
            );

            if (status !== 200) {
                throw new Error('Upload failed');
            }

            if (!headers.etag) {
                throw new Error('Missing eTag');
            }

            eTags.push({
                eTag: headers.etag.replace(/"/g, ''),
                partNumber: part.partNumber,
            });
        }

        await axios.post(
            `${apiRoutes.drive.multipart.commit}/${fileId}`,
            {
                parts: eTags,
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );
    },
};
