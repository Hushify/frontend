import { UploadService } from '@/lib/services/upload';
import { Remote, wrap } from '@/lib/utils/comlink';

class UploadWorker {
    instance!: Remote<typeof UploadService>;

    constructor() {
        if (typeof Worker === 'undefined') {
            return;
        }

        if (this.instance) {
            return;
        }

        const worker = new Worker(new URL('@/lib/services/upload', import.meta.url), {
            type: 'module',
            name: 'hushify-upload-worker',
        });

        this.instance = wrap<typeof UploadService>(worker);
    }
}

export const UploadWorkerInstance = new UploadWorker().instance;
