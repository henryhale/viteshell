import { isFunction } from "../helpers";

/**
 * AbortSignalToken
 *
 * Inspired by the AbortController & AbortSignal
 */
export class AbortSignalToken {
    private handlers: Set<(reason?: unknown) => void>;
    private isCancelled: boolean;

    constructor() {
        this.handlers = new Set();
        this.isCancelled = false;
    }

    public onAbort(handler: (reason?: unknown) => void): void {
        if (!isFunction(handler)) return;
        if (this.isCancelled) {
            handler.call(undefined);
        } else {
            this.handlers.add(handler);
        }
    }

    public abort(reason?: unknown): void {
        if (this.isCancelled) return;
        this.isCancelled = true;
        this.handlers.forEach((fn) => fn.call(undefined, reason));
        this.handlers.clear();
    }

    public reset(): void {
        this.isCancelled = false;
        if (this.handlers.size) this.handlers.clear();
    }
}
