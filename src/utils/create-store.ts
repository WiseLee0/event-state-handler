import { create } from 'zustand';

export function createStoreUtils<T>(initialState: T) {
    const originStore = create<T>(() => initialState);
    type State = keyof T;

    function useStore<K>(params: (state: T) => K): K;
    function useStore<K extends State>(params: K): T[K];
    function useStore<K extends State>(params: K | ((state: T) => K)) {
        if (typeof params === 'string') {
            return originStore((state) => state[params]);
        }

        if (typeof params === 'function') {
            return originStore(params);
        }
    }

    function getState(): T;
    function getState<K extends State>(params: K): T[K];
    function getState<K extends State[]>(params: Readonly<K>): { [I in keyof K]: T[K[I]] };
    function getState<K extends State>(params?: K) {
        const allState = originStore.getState();

        if (typeof params === 'undefined') {
            return allState;
        }

        if (Array.isArray(params)) {
            return params.map((param) => (allState as any)[param]);
        }

        return allState[params];
    }

    function setState(params: T | Partial<T> | ((state: T) => T | Partial<T> | void), replace?: boolean) {
        originStore.setState(params as any, replace as any);
    }

    return {
        useStore,
        getState,
        setState,
    };
}