import { useCallback, useLayoutEffect, useRef } from 'react';

import { FileNodeDecrypted, SelectedNode } from '@/lib/types/drive';

export function useSelectFiles(
    selectedNodes: SelectedNode[],
    setSelectedNodes: React.Dispatch<React.SetStateAction<SelectedNode[]>>,
    files: FileNodeDecrypted[]
) {
    const selectAllFilesRef = useRef<HTMLInputElement>(null);

    useLayoutEffect(() => {
        if (!selectAllFilesRef.current) {
            return;
        }

        if (selectedNodes.length <= 0) {
            selectAllFilesRef.current.indeterminate = false;
            selectAllFilesRef.current.checked = false;
            return;
        }

        if (selectedNodes.filter(s => s.type === 'file').length === files.length) {
            selectAllFilesRef.current.indeterminate = false;
            selectAllFilesRef.current.checked = true;
            return;
        }

        selectAllFilesRef.current.indeterminate = selectedNodes.some(s => s.type === 'file');
    }, [files.length, selectedNodes, selectedNodes.length]);

    const selectAllFiles = useCallback(() => {
        if (!selectAllFilesRef.current) {
            return;
        }

        setSelectedNodes(prev =>
            selectAllFilesRef.current?.checked
                ? [...prev, ...files.map(node => ({ node, type: 'file' as const }))]
                : []
        );
    }, [files, setSelectedNodes]);

    return { selectAllFilesRef, selectAllFiles };
}
