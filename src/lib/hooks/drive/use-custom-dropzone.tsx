'use client';

import { useCallback, useMemo } from 'react';
import { FileWithPath, useDropzone } from 'react-dropzone';

import { FileWithVersion, useUploadStore } from '@/lib/stores/upload-store';
import { DriveList } from '@/lib/types/drive';

export function useCustomDropzone(
    accessToken: string,
    currentFolderKey: string,
    data: DriveList | undefined,
    refetch: () => void
) {
    const queueForUpload = useUploadStore(state => state.queueForUpload);

    const onDrop = useCallback(
        async (acceptedFiles: FileWithPath[]) => {
            if (!data) {
                return;
            }

            const files: FileWithVersion[] = acceptedFiles.map(file => ({
                file,
                previousVersionId: data.files.find(
                    f => f.metadata.name === file.name
                )?.id,
            }));

            await queueForUpload(
                files,
                data.currentFolderId,
                currentFolderKey,
                accessToken,
                refetch
            );
        },
        [accessToken, currentFolderKey, data, queueForUpload, refetch]
    );

    const {
        getRootProps,
        getInputProps,
        isDragActive,
        inputRef: fileRef,
    } = useDropzone({
        onDrop,
        multiple: true,
        noClick: true,
        noKeyboard: true,
    });

    const { getInputProps: getFolderInputProps, inputRef: folderRef } =
        useDropzone({
            onDrop,
            multiple: true,
            noClick: true,
            noKeyboard: true,
            noDrag: true,
        });

    const inputProps = useMemo(getInputProps, [getInputProps]);

    return {
        inputProps,
        isDragActive,
        getFolderInputProps,
        getRootProps,
        fileRef,
        folderRef,
    };
}
