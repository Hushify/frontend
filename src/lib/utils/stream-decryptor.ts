import { StateAddress } from 'libsodium-wrappers-sumo';

import CryptoWorker from '@/lib/services/comlink-crypto';

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
