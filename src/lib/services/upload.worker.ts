import { expose } from 'comlink';

import { UploadService as CommonUploadService } from '@/lib/services/upload';

export const UploadService = CommonUploadService;

expose(UploadService);
