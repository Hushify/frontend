import { useEffect } from 'react';
import { useMultiDrag } from 'react-dnd-multi-backend';

import { SelectedNode } from '@/lib/types/drive';
import { getEmptyImage } from '@/lib/utils/get-empty-image';

export function useDrag(selectedNode: SelectedNode, selectedNodes: SelectedNode[]) {
    const isSelected = selectedNodes.findIndex(n => n.node.id === selectedNode.node.id) >= 0;

    const [[_, drag, preview]] = useMultiDrag({
        type: 'NODE',
        item:
            selectedNodes.length > 0
                ? selectedNodes
                : [{ node: selectedNode.node, type: selectedNode.type }],
        collect: monitor => ({
            isDragging: monitor.isDragging(),
        }),
        canDrag: isSelected || selectedNodes.length === 0,
    });

    useEffect(() => {
        preview(getEmptyImage(), {
            captureDraggingState: true,
        });
    }, [preview]);

    return { drag, isSelected };
}
