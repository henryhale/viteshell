export function isFunction(fn: unknown): fn is (...args: unknown[]) => unknown {
    return typeof fn === 'function';
}

export function isObject(o: unknown): o is object {
    return typeof o === 'object' && o !== null;
}

export function randomInt(): number {
    return Math.floor(Math.random() * 1024 * 50);
}

export function toNumber(n: unknown, fallback = 0): number {
    const i = Number.parseInt(`${n}`);
    return Number.isNaN(i) ? fallback : i;
}
