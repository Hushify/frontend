import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Download, Loader, X } from 'lucide-react';

import { FileNodeDecrypted } from '@/lib/types/drive';
import { StreamDecrypter } from '@/lib/utils/stream-decryptor';
import { getStreamSaver } from '@/lib/utils/stream-saver';
import { StreamSlicer } from '@/lib/utils/stream-slicer';
import { StreamToBlob } from '@/lib/utils/stream-to-blob';

export function Preivew({
    file,
    isPreviewOpen,
    setIsPreviewOpen,
}: {
    file: FileNodeDecrypted | undefined;
    isPreviewOpen: boolean;
    setIsPreviewOpen: Dispatch<SetStateAction<boolean>>;
}) {
    const [fileToPreview, setFileToPreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let url: string | null = null;
        if (!file) {
            return;
        }

        try {
            fetch(file.url)
                .then(response => {
                    if (!response.body) {
                        return null;
                    }

                    return response.body
                        .pipeThrough(new TransformStream(new StreamSlicer()))
                        .pipeThrough(new TransformStream(new StreamDecrypter(file.key)));
                })
                .then(async response => {
                    const content = await StreamToBlob(response);
                    if (!content) {
                        return;
                    }

                    const blob = new Blob([content], { type: file.metadata.mimeType });

                    url = URL.createObjectURL(blob);
                    setFileToPreview(url);
                });
        } catch (error) {
            setError('Can not preview this file.');
        }

        return () => {
            url && URL.revokeObjectURL(url);
            setFileToPreview(null);
            setError(null);
        };
    }, [file]);

    const download = useCallback(async () => {
        if (!file || !fileToPreview) {
            return;
        }
        const streamSaver = await getStreamSaver();
        const writer = streamSaver.createWriteStream(file.metadata.name, {
            size: file.metadata.size,
        });
        const response = await fetch(fileToPreview);
        if (!response.body) {
            return;
        }

        await response.body?.pipeTo(writer);
    }, [file, fileToPreview]);

    if (!file) {
        return null;
    }

    return (
        <Dialog.Root open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
            <Dialog.Portal>
                <Dialog.Content className='fixed inset-0 z-30 flex h-full w-full flex-col gap-1 rounded-md bg-white p-6 shadow focus:outline-none data-[state=open]:animate-previewShow'>
                    <div className='flex shrink-0 items-start justify-between gap-2'>
                        <Dialog.Title className='m-0 font-medium text-gray-900'>
                            <span>Preview: </span>
                            <span className='break-all font-normal'>{file.metadata.name}</span>
                        </Dialog.Title>
                        <div className='flex items-center gap-4'>
                            <button
                                type='button'
                                onClick={download}
                                className='inline-flex h-6 w-6 items-center justify-center rounded-full text-brand-600'
                                aria-label='Download'>
                                <Download />
                            </button>
                            <Dialog.Close asChild>
                                <button
                                    type='button'
                                    className='inline-flex h-6 w-6 items-center justify-center rounded-full text-brand-600'
                                    aria-label='Close'>
                                    <X />
                                </button>
                            </Dialog.Close>
                        </div>
                    </div>
                    <div className='flex h-full w-full flex-auto items-center justify-center py-4'>
                        {fileToPreview && file.metadata.mimeType.startsWith('image/') && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={fileToPreview}
                                alt={file.metadata.name}
                                className='h-full w-full object-contain'
                            />
                        )}
                        {fileToPreview && file.metadata.mimeType.startsWith('video/') && (
                            <video controls autoPlay className='h-full w-full object-contain'>
                                <source src={fileToPreview} type={file.metadata.mimeType} />
                            </video>
                        )}
                        {fileToPreview && file.metadata.mimeType.startsWith('audio/') && (
                            <audio controls autoPlay>
                                <source src={fileToPreview} type={file.metadata.mimeType} />
                            </audio>
                        )}
                        {fileToPreview && file.metadata.mimeType.startsWith('application/pdf') && (
                            <iframe src={fileToPreview} className='h-full w-full object-contain' />
                        )}
                        {!fileToPreview && !error && (
                            <Loader className='h-5 w-5 animate-spin text-brand-600' />
                        )}
                        {error}
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
