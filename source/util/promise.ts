import { PROCESS_ABORTED, PROCESS_TIMED_OUT } from "../constants";
import type { IAbortSignal } from "./signal";

type ExecutableAction<T> = (
    resolve: (value: T) => void,
    reject: (reason?: unknown) => void
) => unknown;

/**
 * Create a promise that can be cancelled via an external signal
 *
 * - If the `timeout` argument is provided, the promise is cancelled
 * if the execution exceeds that time
 */
export function createAbortablePromise<T = unknown>(
    signal: IAbortSignal,
    fn: ExecutableAction<T>,
    timeout?: number
) {
    function createTask() {
        return new Promise<T>((resolve, reject) => {
            signal.onAbort((reason) => reject(reason || PROCESS_ABORTED));
            try {
                fn?.call(undefined, resolve, reject);
            } catch (error) {
                reject(error?.toString());
            }
        });
    }
    if (!timeout) return createTask();
    let task!: Promise<T>;
    return Promise.race([
        (task = createTask()),
        new Promise<void>((_, reject) => {
            const id = setTimeout(() => {
                signal.abort(PROCESS_TIMED_OUT);
            }, timeout);
            function endProcess(reason: unknown) {
                if (id) clearTimeout(id);
                reject(reason);
            }
            task?.catch(endProcess);
            signal.onAbort(endProcess);
        })
    ]);
}
