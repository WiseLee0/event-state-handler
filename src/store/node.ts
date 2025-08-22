import { createStoreUtils } from '@/utils/create-store';
import { createOncePerFrame } from '@/utils/once-per-frame';

interface NodeInterface {
    transformState: boolean;
    sizeState: boolean;
    fillPaintState: boolean;
}
const _node: NodeInterface = {
    transformState: false,
    sizeState: false,
    fillPaintState: false,
}

export const {
    useStore: useNodeState,
    setState: setNodeState,
    getState: getNodeState,
} = createStoreUtils<NodeInterface>(_node);

export const changeTransformState = createOncePerFrame(() => {
    setNodeState({
        transformState: !getNodeState('transformState')
    });
});

export const changeSizeState = createOncePerFrame(() => {
    setNodeState({
        sizeState: !getNodeState('sizeState')
    });
});

export const changeFillPaintState = createOncePerFrame(() => {
    setNodeState({
        fillPaintState: !getNodeState('fillPaintState')
    });
});
