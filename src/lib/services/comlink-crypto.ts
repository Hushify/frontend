import 'client-only';

import { CryptoService } from '@/lib/services/crypto.worker';
import { Remote, wrap } from 'comlink';

class CryptoWorker {
    public cryptoWorker!: Remote<typeof CryptoService>;

    constructor() {
        if (typeof Worker === 'undefined') {
            return;
        }

        const worker = new Worker(
            new URL('@/lib/services/crypto.worker', import.meta.url),
            {
                type: 'module',
                name: 'hushify-crypto-worker',
            }
        );

        this.cryptoWorker = wrap<typeof CryptoService>(worker);
    }
}

export default new CryptoWorker();
