import type { XYWH } from '@/core/types';
import { createStoreUtils } from '@/utils/create-store';
import { findByIds } from './project';
import { mergeBoundingBoxes } from '@/utils/bounding-box';
import { markRenderDirty } from '@/core/engine';

interface SelectionBoxItem {
    matrix: number[];
    width: number;
    height: number;
}
interface MoveInfo {
    type: 'id' | 'selection-box'
    value: string | number
}
interface SelectionInterface {
    ids: Set<string>
    ghostBox: XYWH
    selectionBoxs: SelectionBoxItem[]
    hoverId: string | null
    moveInfo: MoveInfo | null
}
const _selection: SelectionInterface = {
    ids: new Set(),
    ghostBox: [0, 0, 0, 0],
    selectionBoxs: [],
    hoverId: null,
    moveInfo: null
}

const {
    useStore: useSelectionState,
    setState: _setSelectionState,
    getState: getSelectionState,
} = createStoreUtils<SelectionInterface>(_selection);

export const updateSelectionBoxs = (ids: Set<string>): void => {
    if (!ids.size) {
        _setSelectionState({ selectionBoxs: [] })
        return;
    }
    const nodes = findByIds(ids);
    const boxes = nodes.map(node => node.getAbsoluteBoundingBox())
    if (boxes.length > 1) {
        const selectionBox = mergeBoundingBoxes(boxes)
        _setSelectionState({
            selectionBoxs: [{
                width: selectionBox.width,
                height: selectionBox.height,
                matrix: [1, 0, 0, 1, selectionBox.x, selectionBox.y]
            }]
        })
    } else if (boxes.length === 1 && nodes.length === 1) {
        const node = nodes[0]
        _setSelectionState({
            selectionBoxs: [{
                width: node.width,
                height: node.height,
                matrix: node.matrix
            }]
        })
    }
    markRenderDirty()
}

const setSelectionState = (data: Partial<SelectionInterface>) => {
    if (data.ids) {
        updateSelectionBoxs(data.ids)
    }
    if (data.hoverId !== getSelectionState('hoverId')) {
        markRenderDirty()
    }
    _setSelectionState(data)
}

export { useSelectionState, setSelectionState, getSelectionState };
