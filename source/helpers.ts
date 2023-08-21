import { EXIT_SUCCESS } from "./constants";

export function isFunction(fn: unknown): fn is (...args: unknown[]) => unknown {
    return typeof fn === "function";
}

export function isObject(o: unknown): o is object {
    return typeof o === "object" && o !== null;
}

export function randomInt(): number {
    return Math.floor(Math.random() * 1024 * 30);
}

export function toNumber(n: unknown, fallback = EXIT_SUCCESS): number {
    const i = parseInt("" + n);
    return isNaN(i) ? fallback : i;
}

/**
 * Create an open `promise` exposing the `resolve` and `reject`
 * out of the promise execution context.
 */
export function createOpenPromise<T>() {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: unknown) => void;

    // track promise state
    let isComplete = false;

    const promise = new Promise<T>((res, rej) => {
        resolve = (result) => !isComplete && (isComplete = true) && res(result);
        reject = (reason) => !isComplete && (isComplete = true) && rej(reason);
    });

    return {
        get isComplete() {
            return isComplete;
        },
        get promise() {
            return promise;
        },
        get resolve() {
            return resolve;
        },
        get reject() {
            return reject;
        }
    };
}
