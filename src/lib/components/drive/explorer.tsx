import { Dispatch, SetStateAction } from 'react';
import { QueryStatus } from '@tanstack/react-query';
import { Soup } from 'lucide-react';
import { RectReadOnly } from 'react-use-measure';

import { ContextMenu } from '@/lib/components/context-menu';
import { Files } from '@/lib/components/drive/files';
import { Folders } from '@/lib/components/drive/folders';
import { ScrollArea } from '@/lib/components/scroll-area';
import { useMoveNodes } from '@/lib/hooks/drive/use-move-nodes';
import { FileNodeDecrypted, FolderNodeDecrypted, SelectedNode } from '@/lib/types/drive';
import { MenuItem, MenuSeparator } from '@/lib/types/menu';

export function Explorer({
    files,
    folders,
    status,
    menuItems,
    bounds,
    boundsRest,
    selectedNodes,
    setSelectedNodes,
    moveMutation,
}: {
    files: FileNodeDecrypted[];
    folders: FolderNodeDecrypted[];
    status: QueryStatus;
    menuItems: (MenuItem | MenuSeparator)[];
    bounds: RectReadOnly;
    boundsRest: RectReadOnly;
    selectedNodes: SelectedNode[];
    setSelectedNodes: Dispatch<SetStateAction<SelectedNode[]>>;
    moveMutation: ReturnType<typeof useMoveNodes>;
}) {
    return (
        <ScrollArea
            style={{
                height: document.body.clientHeight - bounds.top - boundsRest.height,
            }}>
            <ContextMenu.Root>
                <ContextMenu.Trigger asChild>
                    <ScrollArea.Viewport className='h-full w-full rounded'>
                        {status === 'success' && folders.length === 0 && files.length === 0 && (
                            <div className='absolute inset-0 flex select-none flex-col items-center justify-center gap-4'>
                                <Soup className='h-12 w-12 fill-brand-600 text-brand-600' />
                                <div className='flex flex-col items-center justify-center gap-1'>
                                    <div className='text-2xl'>No Files or Folders found</div>
                                    <div>Start by dragging a file</div>
                                </div>
                            </div>
                        )}

                        <Folders
                            folders={folders}
                            selectedNodes={selectedNodes}
                            setSelectedNodes={setSelectedNodes}
                            onMove={moveMutation.mutateAsync}
                        />

                        <Files
                            files={files}
                            selectedNodes={selectedNodes}
                            setSelectedNodes={setSelectedNodes}
                        />
                    </ScrollArea.Viewport>
                </ContextMenu.Trigger>
                <ContextMenu items={menuItems} />
            </ContextMenu.Root>
        </ScrollArea>
    );
}
