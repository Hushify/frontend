export type FileTypes = {
    audio: string[];
    videos: string[];
    images: string[];
    documents: string[];
};

export const fileTypes: FileTypes = {
    audio: ['audio/3gpp', 'audio/3gpp2', 'audio/3gp2'],
    videos: ['video/3gpp', 'video/3gpp2', 'video/3gp2'],
    images: [''],
    documents: [''],
};
