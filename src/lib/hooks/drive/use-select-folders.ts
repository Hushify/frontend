import { useCallback, useLayoutEffect, useRef } from 'react';

import { FolderNodeDecrypted, SelectedNode } from '@/lib/types/drive';

export function useSelectFolders(
    selectedNodes: SelectedNode[],
    setSelectedNodes: React.Dispatch<React.SetStateAction<SelectedNode[]>>,
    folders: FolderNodeDecrypted[]
) {
    const selectAllFoldersRef = useRef<HTMLInputElement>(null);

    useLayoutEffect(() => {
        if (!selectAllFoldersRef.current) {
            return;
        }

        if (selectedNodes.length <= 0) {
            selectAllFoldersRef.current.indeterminate = false;
            selectAllFoldersRef.current.checked = false;
            return;
        }

        if (selectedNodes.filter(s => s.type === 'folder').length === folders.length) {
            selectAllFoldersRef.current.indeterminate = false;
            selectAllFoldersRef.current.checked = true;
            return;
        }

        selectAllFoldersRef.current.indeterminate = selectedNodes.some(s => s.type === 'folder');
    }, [folders.length, selectedNodes, selectedNodes.length]);

    const selectAllFolders = useCallback(() => {
        if (!selectAllFoldersRef.current) {
            return;
        }

        setSelectedNodes(prev =>
            selectAllFoldersRef.current?.checked
                ? [...prev, ...folders.map(node => ({ node, type: 'folder' as const }))]
                : []
        );
    }, [folders, setSelectedNodes]);

    return { selectAllFoldersRef, selectAllFolders };
}
