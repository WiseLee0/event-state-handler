import { createStoreUtils } from '@/utils/create-store';

interface HotKeyInterface {
    keySet: Set<string>,
    isMainPressed: boolean
    isAltPressed: boolean
    isShiftPressed: boolean
}
const _hotKey: HotKeyInterface = {
    keySet: new Set(),
    // 检测是否按下了主修饰键（Ctrl 或 Cmd）
    isMainPressed: false,
    // 检测是否按下了次修饰键（Alt 或 Option）
    isAltPressed: false,
    // 检测是否按下了Shift
    isShiftPressed: false
}

export const {
    useStore: useHotKeyState,
    setState: setHotKeyState,
    getState: getHotKeyState,
} = createStoreUtils<HotKeyInterface>(_hotKey);