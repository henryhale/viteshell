import { PROCESS_ABORTED, PROCESS_TIMED_OUT } from "../constants";

type ExecutableAction = (
    signal: AbortSignal,
    reject: (reason?: unknown) => void
) => Promise<void>;

/**
 * Create a promise that can be cancelled via an external signal
 *
 * - If the `timeout` argument is provided, the promise is cancelled
 * if the execution exceeds that time
 */
export function createAbortablePromise(
    controller: AbortController,
    executor: ExecutableAction,
    timeout?: number
) {
    const { signal } = controller;

    let id: number;
    if (timeout && timeout > 0) {
        id = setTimeout(() => {
            controller.abort(PROCESS_TIMED_OUT);
        }, timeout);
    }

    return new Promise<void>((resolve, reject) => {
        signal.addEventListener("abort", () => {
            clearTimeout(id);
            reject(signal.reason.toString() || PROCESS_ABORTED);
        });
        executor(signal, reject)
            .then(resolve)
            .catch(reject)
            .finally(() => clearTimeout(id));
    });
}
