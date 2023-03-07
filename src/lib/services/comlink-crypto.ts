import 'client-only';
import { CryptoService } from '@/lib/services/crypto.worker';
import { Remote, wrap } from '@/lib/utils/comlink';

class CryptoWorker {
    public instance!: Remote<typeof CryptoService>;

    constructor() {
        if (typeof Worker === 'undefined') {
            return;
        }

        if (this.instance) {
            return;
        }

        const worker = new Worker(
            new URL('@/lib/services/crypto.worker', import.meta.url),
            {
                type: 'module',
                name: 'hushify-crypto-worker',
            }
        );

        this.instance = wrap<typeof CryptoService>(worker);
    }
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new CryptoWorker();
