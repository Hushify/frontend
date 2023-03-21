'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader } from 'lucide-react';
import { HTML5toTouch } from 'rdndmb-html5-to-touch';
import { DndProvider } from 'react-dnd-multi-backend';
import useMeasure from 'react-use-measure';

import { Breadcrumbs } from '@/lib/components/drive/breadcrumbs';
import { DragPreview } from '@/lib/components/drive/drag-preview';
import { Explorer } from '@/lib/components/drive/explorer';
import { FullscreenUpload } from '@/lib/components/drive/fullscreen-upload';
import { NewFolder } from '@/lib/components/drive/new-folder';
import { Preivew } from '@/lib/components/drive/preview';
import { Rename } from '@/lib/components/drive/rename';
import { UploadProgressBox } from '@/lib/components/drive/upload-progress';
import { Toolbar } from '@/lib/components/toolbar';
import { useCustomDropzone } from '@/lib/hooks/drive/use-custom-dropzone';
import { useDriveList } from '@/lib/hooks/drive/use-drive-list';
import { useMenuItems } from '@/lib/hooks/drive/use-menu-items';
import { useMoveNodes } from '@/lib/hooks/drive/use-move-nodes';
import { deleteNodes } from '@/lib/services/drive';
import { useAuthStore } from '@/lib/stores/auth-store';
import { BreadcrumbDecrypted, FileNodeDecrypted, SelectedNode } from '@/lib/types/drive';

export default function Drive({ params: { id } }: { params: { id?: string[] } }) {
    const accessToken = useAuthStore(state => state.accessToken)!;
    const masterKey = useAuthStore(state => state.masterKey)!;

    const currentFolderId = id?.at(0) ?? null;

    const { data, status, refetch } = useDriveList(currentFolderId, accessToken, masterKey);

    const currentFolderKey = useMemo(
        () =>
            data && data.breadcrumbs.length > 0
                ? data?.breadcrumbs.find(c => c.id === currentFolderId)?.key ?? masterKey
                : masterKey,
        [currentFolderId, data, masterKey]
    );

    const [selectedNodes, setSelectedNodes] = useState<SelectedNode[]>([]);

    useEffect(() => {
        setSelectedNodes([]);
    }, [currentFolderId]);

    const clearSelection = useCallback(() => {
        setSelectedNodes([]);
    }, []);

    const deleteCb = useCallback(
        async ({ folderIds, fileIds }: { folderIds: string[]; fileIds: string[] }) => {
            const result = await deleteNodes(folderIds, fileIds, accessToken);
            if (!result.success) {
                throw new Error('Deletion failed!');
            }

            clearSelection();
            refetch();
        },
        [accessToken, clearSelection, refetch]
    );

    const moveMutation = useMoveNodes(currentFolderId, accessToken, clearSelection);

    const { fileRef, folderRef, getFolderInputProps, rootProps, inputProps, isDragActive } =
        useCustomDropzone(accessToken, currentFolderKey, data, refetch);

    const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
    const [isRenameOpen, setIsRenameOpen] = useState(false);

    const [fileForPreview, setFileForPreview] = useState<FileNodeDecrypted>();
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const [ref, bounds] = useMeasure();
    const [refRest, boundsRest] = useMeasure();

    const menuItems = useMenuItems(
        selectedNodes,
        deleteCb,
        setFileForPreview,
        setIsNewFolderOpen,
        setIsPreviewOpen,
        setIsRenameOpen,
        folderRef,
        fileRef
    );

    return (
        <DndProvider
            options={{
                backends: HTML5toTouch.backends.map(backend => {
                    backend.preview = true;
                    return backend;
                }),
            }}>
            <div className='h-full w-full' {...rootProps}>
                <FullscreenUpload isDragActive={isDragActive} inputProps={inputProps} />

                <input
                    {...getFolderInputProps()}
                    // @ts-expect-error
                    webkitdirectory=''
                    mozdirectory=''
                    nwdirectory=''
                    directory=''
                />

                <UploadProgressBox />

                <div className='relative h-full' ref={ref}>
                    {status === 'error' && (
                        <div className='absolute inset-0 grid place-items-center text-red-600'>
                            Error
                        </div>
                    )}

                    {status === 'loading' && (
                        <div className='absolute inset-0 grid place-items-center'>
                            <Loader size={32} className='animate-spin stroke-brand-600' />
                        </div>
                    )}

                    <div ref={refRest}>
                        <div className='relative z-10'>
                            {fileForPreview && (
                                <Preivew
                                    file={fileForPreview}
                                    isPreviewOpen={isPreviewOpen}
                                    setIsPreviewOpen={setIsPreviewOpen}
                                />
                            )}

                            {/* <Share /> */}

                            <NewFolder
                                folders={data?.folders}
                                currentFolderId={currentFolderId}
                                currentFolderKey={currentFolderKey}
                                isNewFolderOpen={isNewFolderOpen}
                                setIsNewFolderOpen={setIsNewFolderOpen}
                            />

                            {selectedNodes.length === 1 && (
                                <Rename
                                    nodes={
                                        selectedNodes.at(0)!.type === 'folder'
                                            ? data?.folders
                                            : data?.files
                                    }
                                    selectedeNode={selectedNodes.at(0)!}
                                    isRenameOpen={isRenameOpen}
                                    setIsRenameOpen={setIsRenameOpen}
                                    currentFolderId={currentFolderId}
                                    onSuccess={clearSelection}
                                />
                            )}
                        </div>

                        <Toolbar items={menuItems} />

                        <Breadcrumbs
                            items={data?.breadcrumbs ?? ([] as BreadcrumbDecrypted[])}
                            workspaceId={data?.workspaceFolderId}
                            onMove={moveMutation.mutateAsync}
                        />
                    </div>

                    <Explorer
                        data={data}
                        status={status}
                        menuItems={menuItems}
                        bounds={bounds}
                        boundsRest={boundsRest}
                        selectedNodes={selectedNodes}
                        setSelectedNodes={setSelectedNodes}
                        moveMutation={moveMutation}
                    />
                </div>
            </div>
            <DragPreview />
        </DndProvider>
    );
}
