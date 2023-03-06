import { usePreview } from 'react-dnd-multi-backend';

export function DragPreview() {
    const preview = usePreview();

    if (!preview.display) {
        return null;
    }

    const offset = preview.monitor.getClientOffset();
    const length = Array.isArray(preview.item) ? preview.item.length : 0;

    return (
        <div
            className='pointer-events-none fixed left-0 top-0 rounded bg-brand-400 px-2 py-1 text-sm text-white'
            style={{
                transform: `translate(${offset?.x ?? 0}px, ${
                    offset?.y ?? 0
                }px)`,
            }}>
            Moving {length} {length === 1 ? 'node' : 'nodes'}.
        </div>
    );
}
