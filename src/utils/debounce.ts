export function debounce<T extends (...args: any[]) => any>(
    func: T,
    delay = 200
): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
        const context = this;

        const later = () => {
            timeout = null;
            func.apply(context, args);
        };

        if (timeout !== null) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(later, delay);
    };
}