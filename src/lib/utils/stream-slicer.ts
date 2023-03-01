import { StateAddress } from 'libsodium-wrappers-sumo';

import CryptoWorker from '@/lib/services/comlink-crypto';
import { ENCRYPTED_CHUNK_SIZE } from '@/lib/services/upload.worker';

export default class StreamSlicer {
    protected chunkSize: number;
    protected partialChunk: Uint8Array;
    protected offset: number;

    constructor(chunkSize?: number) {
        this.chunkSize = chunkSize ?? ENCRYPTED_CHUNK_SIZE;
        this.partialChunk = new Uint8Array(this.chunkSize);
        this.offset = 0;
    }

    public send(buf: any, controller: any) {
        controller.enqueue(buf);
        this.partialChunk = new Uint8Array(this.chunkSize);
        this.offset = 0;
    }

    public transform(chunk: Uint8Array, controller: any) {
        let i = 0;

        if (this.offset > 0) {
            const len = Math.min(
                chunk.byteLength,
                this.chunkSize - this.offset
            );
            this.partialChunk.set(chunk.slice(0, len), this.offset);
            this.offset += len;
            i += len;

            if (this.offset === this.chunkSize) {
                this.send(this.partialChunk, controller);
            }
        }

        while (i < chunk.byteLength) {
            const remainingBytes = chunk.byteLength - i;
            if (remainingBytes >= this.chunkSize) {
                const record = chunk.slice(i, i + this.chunkSize);
                i += this.chunkSize;
                this.send(record, controller);
            } else {
                const end = chunk.slice(i, i + remainingBytes);
                i += end.byteLength;
                this.partialChunk.set(end);
                this.offset = end.byteLength;
            }
        }
    }

    public flush(controller: any) {
        if (this.offset > 0) {
            controller.enqueue(this.partialChunk.slice(0, this.offset));
        }
    }
}

export class StreamDecrypter {
    protected chunkIndex: number = 0;
    protected HEADER_SIZE: number = 64 * 1024;
    protected BLOCK_SIZE: number = 64 * 1024;
    protected key: string;
    protected state: StateAddress | undefined;

    constructor(key: string) {
        this.key = key;
    }

    public async transform(
        chunk: Uint8Array,
        controller: TransformStreamDefaultController<Uint8Array>
    ) {
        const worker = CryptoWorker.cryptoWorker;

        if (this.chunkIndex === 0) {
            const header = await worker.unpad(chunk, this.BLOCK_SIZE);
            this.state = await worker.streamingDecryptionInit(header, this.key);
            this.chunkIndex++;
        } else {
            const { message } = await worker.streamingDecryptionPull(
                this.state!,
                chunk
            );
            controller.enqueue(message);
            this.chunkIndex++;
        }
    }
}
