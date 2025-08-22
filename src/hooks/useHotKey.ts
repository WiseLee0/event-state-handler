import { getHotKeyState, setHotKeyState } from '@/store/hotkey';
import { useEffect } from 'react';

export const isMac = /mac|iphone|ipad|ipod/i.test(navigator.userAgent.toLowerCase());

function keydownHotKeyState(event: KeyboardEvent) {
    const keySet = getHotKeyState('keySet') || new Set()
    const key = event.key.toLowerCase();
    keySet.add(key);
    setHotKeyState({
        isMainPressed: isMac ? event.metaKey : event.ctrlKey,
        isAltPressed: event.altKey,
        isShiftPressed: event.shiftKey,
        keySet
    });
}

function keyupHotKeyState(event: KeyboardEvent) {
    const keySet = getHotKeyState('keySet') || new Set()
    const key = event.key.toLowerCase();
    keySet.delete(key)
    setHotKeyState({
        isMainPressed: isMac ? event.metaKey : event.ctrlKey,
        isAltPressed: event.altKey,
        isShiftPressed: event.shiftKey,
        keySet
    });
}

export const useHotKey = () => {
    useEffect(() => {
        // 监听全局按键
        document.addEventListener('keydown', keydownHotKeyState);
        document.addEventListener('keyup', keyupHotKeyState);

        return () => {
            document.removeEventListener('keydown', keydownHotKeyState);
            document.removeEventListener('keyup', keyupHotKeyState);
        }
    }, [])
}

