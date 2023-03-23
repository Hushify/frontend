import { CryptoService } from '@/lib/services/crypto';
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

        const worker = new Worker(new URL('@/lib/services/crypto', import.meta.url), {
            type: 'module',
            name: 'hushify-crypto-worker',
        });

        this.instance = wrap<typeof CryptoService>(worker);
    }
}

export const CryptoWorkerInstance = new CryptoWorker().instance;
