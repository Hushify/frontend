import { UploadService as CommonUploadService } from '@/lib/services/upload';
import { expose } from '@/lib/utils/comlink';

export const UploadService = CommonUploadService;

expose(UploadService);
