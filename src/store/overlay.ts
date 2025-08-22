import { createStoreUtils } from '@/utils/create-store';

interface OverlayInterface {
    nodes: React.ReactNode[];
}
const _overlay: OverlayInterface = {
    nodes: [],
}

export const {
    useStore: useOverlayState,
    setState: setOverlayState,
    getState: getOverlayState,
} = createStoreUtils<OverlayInterface>(_overlay);
