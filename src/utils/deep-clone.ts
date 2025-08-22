/**
 * @param source 要拷贝的数据
 * @param weakMap 用于循环引用的WeakMap（内部使用）
 * @returns 深拷贝后的数据
 */
export function deepClone<T>(source: T, weakMap = new WeakMap<any, any>()): T {
    // 处理原始类型和函数
    if (source === null || typeof source !== 'object' || typeof source === 'function') {
        return source;
    }

    // 处理循环引用
    if (weakMap.has(source)) {
        return weakMap.get(source);
    }

    // 处理Date对象
    if (source instanceof Date) {
        const copy = new Date(source.getTime());
        weakMap.set(source, copy);
        return copy as any;
    }

    // 处理RegExp对象
    if (source instanceof RegExp) {
        const copy = new RegExp(source.source, source.flags);
        weakMap.set(source, copy);
        return copy as any;
    }

    // 处理Map
    if (source instanceof Map) {
        const copy = new Map();
        weakMap.set(source, copy);
        source.forEach((value, key) => {
            copy.set(deepClone(key, weakMap), deepClone(value, weakMap));
        });
        return copy as any;
    }

    // 处理Set
    if (source instanceof Set) {
        const copy = new Set();
        weakMap.set(source, copy);
        source.forEach(value => {
            copy.add(deepClone(value, weakMap));
        });
        return copy as any;
    }

    // 处理ArrayBuffer
    if (source instanceof ArrayBuffer) {
        const copy = source.slice(0);
        weakMap.set(source, copy);
        return copy as any;
    }

    // 处理TypedArray
    if (ArrayBuffer.isView(source)) {
        const copy = (source as any).slice();
        weakMap.set(source, copy);
        return copy;
    }

    // 处理普通对象和数组
    const copy: any = Array.isArray(source) ? [] : Object.create(Object.getPrototypeOf(source));
    weakMap.set(source, copy);

    // 使用Reflect.ownKeys获取所有自有属性（包括Symbol）
    for (const key of Reflect.ownKeys(source)) {
        const descriptor = Object.getOwnPropertyDescriptor(source, key);
        if (descriptor) {
            if ('value' in descriptor) {
                // 数据属性
                Object.defineProperty(copy, key, {
                    ...descriptor,
                    value: deepClone(descriptor.value, weakMap)
                });
            } else {
                // 访问器属性
                Object.defineProperty(copy, key, descriptor);
            }
        }
    }

    return copy;
}