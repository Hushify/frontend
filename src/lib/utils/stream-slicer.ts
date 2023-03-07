import { StateAddress } from 'libsodium-wrappers-sumo';

import CryptoWorker from '@/lib/services/comlink-crypto';
import { ENCRYPTED_CHUNK_SIZE, HEADER_SIZE } from '@/lib/services/upload';

export default class StreamSlicer {
    protected chunkSize: number;
    protected partialChunk: Uint8Array;
    protected offset: number;
    #actualChunkSize: number = 0;
    #idx: number = 0;

    constructor(chunkSize?: number) {
        this.chunkSize = HEADER_SIZE;
        this.#actualChunkSize = chunkSize ?? ENCRYPTED_CHUNK_SIZE;

        this.partialChunk = new Uint8Array(this.chunkSize);
        this.offset = 0;
    }

    public send(
        buf: any,
        controller: TransformStreamDefaultController<Uint8Array>
    ) {
        controller.enqueue(buf);

        if (this.#idx === 1) {
            this.chunkSize = this.#actualChunkSize;
        }

        this.partialChunk = new Uint8Array(this.chunkSize);
        this.offset = 0;
    }

    public transform(
        chunk: Uint8Array,
        controller: TransformStreamDefaultController<Uint8Array>
    ) {
        this.#idx++;

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
    protected key: string;
    protected state: StateAddress | undefined;

    constructor(key: string) {
        this.key = key;
    }

    public async transform(
        chunk: Uint8Array,
        controller: TransformStreamDefaultController<Uint8Array>
    ) {
        const worker = CryptoWorker.instance;

        if (this.chunkIndex === 0) {
            this.state = await worker.streamingDecryptionInit(
                new Uint8Array(chunk),
                this.key
            );
            this.chunkIndex++;
            return;
        }

        if (!this.state) {
            throw new Error('Decryption failed, state missing.');
        }

        const { message, tag } = await worker.streamingDecryptionPull(
            this.state,
            new Uint8Array(chunk)
        );

        if (tag === undefined || (tag !== 0 && tag !== 3)) {
            throw new Error('Decryption failed.');
        }

        controller.enqueue(message);
    }
}
