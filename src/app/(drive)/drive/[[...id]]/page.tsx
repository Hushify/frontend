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
import { UploadProgress } from '@/lib/components/drive/upload-progress';
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
    const clearSelection = useCallback(() => setSelectedNodes([]), []);
    useEffect(clearSelection, [clearSelection, currentFolderId]);

    const moveMutation = useMoveNodes(currentFolderId, accessToken, clearSelection);

    const { fileRef, folderRef, getFolderInputProps, rootProps, inputProps, isDragActive } =
        useCustomDropzone(accessToken, currentFolderKey, data, refetch);

    const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
    const [isRenameOpen, setIsRenameOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const [ref, bounds] = useMeasure();
    const [refRest, boundsRest] = useMeasure();

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

    const menuItems = useMenuItems(
        selectedNodes,
        deleteCb,
        setIsNewFolderOpen,
        setIsPreviewOpen,
        setIsRenameOpen,
        folderRef,
        fileRef
    );

    return (
        <DndProvider
            options={{
                backends: HTML5toTouch.backends.map(backend => ({ ...backend, preview: true })),
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

                <UploadProgress />

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
                            <Preivew
                                file={
                                    selectedNodes.at(0)?.type === 'file'
                                        ? (selectedNodes.at(0)?.node as FileNodeDecrypted)
                                        : undefined
                                }
                                isPreviewOpen={isPreviewOpen}
                                setIsPreviewOpen={setIsPreviewOpen}
                            />

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
                                        selectedNodes[0].type === 'folder'
                                            ? data?.folders
                                            : data?.files
                                    }
                                    selectedeNode={selectedNodes[0]}
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
