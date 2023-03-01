import 'client-only';
import { Remote, wrap } from 'comlink';

import { UploadService } from '@/lib/services/upload.worker';

class UploadWorker {
    instance!: Remote<typeof UploadService>;

    constructor() {
        if (typeof Worker === 'undefined') {
            return;
        }

        if (this.instance) {
            return;
        }

        const worker = new Worker(
            new URL('@/lib/services/upload.worker', import.meta.url),
            {
                type: 'module',
                name: 'hushify-upload-worker',
            }
        );

        this.instance = wrap<typeof UploadService>(worker);
    }
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new UploadWorker();
