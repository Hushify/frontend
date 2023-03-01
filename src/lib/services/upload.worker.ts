import axios from 'axios';
import { expose } from 'comlink';
import {
    crypto_secretstream_xchacha20poly1305_ABYTES,
    crypto_secretstream_xchacha20poly1305_HEADERBYTES,
} from 'libsodium-wrappers-sumo';
import pQueue from 'p-queue';

import { apiRoutes } from '@/lib/data/routes';
import CryptoWorker from '@/lib/services/comlink-crypto';

const queue = new pQueue({ concurrency: 5 });
export const AMZ_CHUNK_SIZE = 5 * 1024 * 1024;
export const DEFAULT_CHUNK_SIZE = 65519; // 64 kb - 17 bytes (MAC Bytes + 1)
export const ENCRYPTED_CHUNK_SIZE = DEFAULT_CHUNK_SIZE + 17; // 64 kb - 17 bytes (MAC Bytes + 1)

export const UploadService = {
    prepareFileForMultipartUpload: async (
        parentFolderId: string,
        name: string,
        previousVersionId: string | undefined,
        mimeType: string,
        fileSize: number,
        accessToken: string,
        currentFolderKey: string,
        chunkSize: number = DEFAULT_CHUNK_SIZE
    ) => {
        const numberOfChunks = Math.ceil(fileSize / chunkSize);

        const encryptedChunkSize =
            chunkSize + crypto_secretstream_xchacha20poly1305_ABYTES;

        const headerBytesWithPotentialPadding =
            Math.ceil(crypto_secretstream_xchacha20poly1305_HEADERBYTES / 64) *
            64 *
            1024;

        const encryptedSize =
            numberOfChunks * encryptedChunkSize +
            headerBytesWithPotentialPadding;

        const numberOfEncryptedChunks = Math.ceil(
            encryptedSize / AMZ_CHUNK_SIZE
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
        file: File,
        fileKey: string,
        accessToken: string,
        fileId: string,
        parts: { partNumber: number; preSignedUrl: string }[],
        onProgress: () => void,
        chunkSize: number = DEFAULT_CHUNK_SIZE
    ) => {
        const numberOfChunks = Math.ceil(file.size / chunkSize);

        const cryptoWorker = CryptoWorker.cryptoWorker;
        const { state, header } = await cryptoWorker.streamingEncryptionInit(
            fileKey
        );

        const paddedHeader = await cryptoWorker.pad(header, 64 * 1024);

        const eTags: { eTag: string; partNumber: number }[] = [];

        try {
            await Promise.all(
                parts.map((part, i) =>
                    queue.add(async () => {
                        let amzChunk = new Uint8Array(AMZ_CHUNK_SIZE);
                        let cursor = i * AMZ_CHUNK_SIZE;
                        let size = 0;
                        if (i === 0) {
                            amzChunk.set(paddedHeader, 0);
                            size += paddedHeader.byteLength;
                        }

                        for (let j = 0; j < AMZ_CHUNK_SIZE - size; j += 64) {
                            const slice = cursor + chunkSize;

                            const chunk = file.slice(
                                cursor,
                                slice > file.size ? file.size : slice
                            );

                            cursor += chunk.size;

                            if (chunk.size === 0) {
                                break;
                            }

                            const encryptedChunk =
                                await cryptoWorker.streamingEncryptionPush(
                                    state,
                                    new Uint8Array(await chunk.arrayBuffer()),
                                    j === numberOfChunks - 1
                                );

                            size += encryptedChunk.byteLength;

                            amzChunk.set(
                                encryptedChunk,
                                j + i === 0 ? paddedHeader.byteLength : 0
                            );
                        }

                        const { headers, status } = await axios.put(
                            part.preSignedUrl,
                            amzChunk.slice(0, size),
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

                        onProgress();
                    })
                )
            );
        } catch (error) {
            console.log(error);
            throw error;
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

expose(UploadService);
