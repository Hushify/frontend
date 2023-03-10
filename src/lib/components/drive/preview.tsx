import {
    Dispatch,
    SetStateAction,
    useCallback,
    useEffect,
    useState,
} from 'react';
import Image from 'next/image';
import * as Dialog from '@radix-ui/react-dialog';
import { Download, Loader, X } from 'lucide-react';

import { FileNodeDecrypted } from '@/lib/services/drive';
import { streamSaver } from '@/lib/utils/stream-saver';
import StreamSlicer, { StreamDecrypter } from '@/lib/utils/stream-slicer';

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
                        .pipeThrough(
                            new TransformStream(new StreamDecrypter(file.key))
                        );
                })
                .then(response => {
                    if (!response) {
                        return null;
                    }

                    let content = new Uint8Array();
                    const reader = response.getReader();

                    function saveChunk({
                        done,
                        value,
                    }: ReadableStreamReadResult<Uint8Array>) {
                        if (done) {
                            url = URL.createObjectURL(
                                new Blob([content], {
                                    type: file!.metadata.mimeType,
                                })
                            );
                            setFileToPreview(url);
                            return;
                        }

                        content = new Uint8Array([...content, ...value]);

                        reader.read().then(saveChunk);
                    }

                    reader.read().then(saveChunk);
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
                <Dialog.Content className='fixed inset-0 flex h-full w-full flex-col gap-1 rounded-md bg-white p-6 shadow focus:outline-none data-[state=open]:animate-previewShow'>
                    <div className='flex shrink-0 items-start justify-between gap-2'>
                        <Dialog.Title className='m-0 font-medium text-gray-900'>
                            <span>Preview: </span>
                            <span className='break-all font-normal'>
                                {file.metadata.name}
                            </span>
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
                    <div className='relative my-4 flex-auto'>
                        {fileToPreview &&
                            file.metadata.mimeType.startsWith('image/') && (
                                <Image
                                    src={fileToPreview}
                                    alt={file.metadata.name}
                                    className='aspect-auto object-contain'
                                    fill
                                />
                            )}
                        {fileToPreview &&
                            file.metadata.mimeType.startsWith('video/') && (
                                <div className='absolute inset-0'>
                                    <video
                                        controls
                                        autoPlay
                                        className='h-full w-full object-contain'>
                                        <source
                                            src={fileToPreview}
                                            type={file.metadata.mimeType}
                                        />
                                    </video>
                                </div>
                            )}
                        {fileToPreview &&
                            file.metadata.mimeType.startsWith(
                                'application/pdf'
                            ) && (
                                <div className='absolute inset-0'>
                                    <iframe
                                        src={fileToPreview}
                                        className='h-full w-full object-contain'
                                    />
                                </div>
                            )}
                        {!fileToPreview && !error && (
                            <div className='absolute inset-0 flex items-center justify-center'>
                                <Loader className='h-5 w-5 animate-spin text-brand-600' />
                            </div>
                        )}
                        {error && (
                            <div className='absolute inset-0 flex items-center justify-center text-red-600'>
                                {error}
                            </div>
                        )}
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
