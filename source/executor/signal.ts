import { isFunction } from "../helpers";

export type IAbortSignal = {
    isAborted: boolean;
    abort: (reason?: unknown) => void;
    onAbort: (handler: (reason?: unknown) => void) => void;
    reset: () => void;
};

/**
 * AbortSignal
 *
 * Inspired by the window.AbortController & window.AbortSignal
 */
export function createAbortSignal(): IAbortSignal {
    const handlers = new Set<(msg?: unknown) => void>();
    let aborted = false;

    function onAbort(handler: (reason?: unknown) => void): void {
        if (!isFunction(handler)) return;
        if (aborted) {
            handler.call(undefined);
        } else {
            handlers.add(handler);
        }
    }

    function abort(reason?: unknown): void {
        if (aborted) return;
        aborted = true;
        handlers.forEach((fn) => fn.call(undefined, reason));
    }

    function reset(): void {
        aborted = false;
        if (handlers.size) handlers.clear();
    }

    return {
        abort,
        onAbort,
        reset,
        get isAborted() {
            return aborted;
        }
    };
}
