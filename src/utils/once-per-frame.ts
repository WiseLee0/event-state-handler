export function createOncePerFrame<T extends any[]>(fn: (...args: T) => void) {
  let rafId: number | null = null;
  let lastArgs: T | null = null;

  return (...args: T) => {
    lastArgs = args;
    if (rafId !== null) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      const callArgs = (lastArgs ?? ([] as unknown as T));
      lastArgs = null;
      fn(...callArgs);
    });
  };
}

const rafRegistry = new Map<string, number>();
export function oncePerFrameKeyed(key: string, cb: () => void) {
  if (rafRegistry.has(key)) return;
  const id = requestAnimationFrame(() => {
    rafRegistry.delete(key);
    cb();
  });
  rafRegistry.set(key, id);
}
