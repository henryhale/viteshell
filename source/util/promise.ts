import { PROCESS_ABORTED, PROCESS_TIMED_OUT } from "../constants";

type ExecutableAction<T = unknown> = (
    resolve: (value: T) => void,
    reject: (reason?: unknown) => void,
    signal: AbortSignal
) => unknown;

/**
 * Create a promise that can be cancelled via an external signal
 *
 * - If the `timeout` argument is provided, the promise is cancelled
 * if the execution exceeds that time
 */
export function createAbortablePromise<T>(
    executor: ExecutableAction<T>,
    controller: AbortController,
    timeout?: number
) {
    const signal = controller.signal;

    const task = new Promise<T>((resolve, reject) => {
        signal.addEventListener("abort", () => {
            reject(signal.reason || PROCESS_ABORTED);
        });
        executor.call(undefined, resolve, reject, signal);
    });

    if (!(timeout && timeout > 0)) {
        return task;
    }

    const timer = new Promise<void>((resolve, reject) => {
        // eslint-disable-next-line prefer-const
        let id: unknown;
        signal.addEventListener("abort", () => {
            clearTimeout(id as number);
            reject(signal.reason || PROCESS_ABORTED);
        });
        signal.addEventListener("success", () => {
            clearTimeout(id as number);
            resolve();
        });
        id = setTimeout(() => {
            controller.abort(PROCESS_TIMED_OUT);
        }, timeout);
    });

    return Promise.race([timer, task]).finally(() => {
        controller.signal.dispatchEvent(new CustomEvent("success"));
    });
}
