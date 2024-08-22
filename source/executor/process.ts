import { EXIT_CODE_ID, PROCESS_TERMINATED, VERSION } from '../constants';
import { toNumber } from '../helpers';
import type { IProcess } from '../interface';
import type { IState } from '../state';
import { replaceEnvVariables } from '../state/env';
import type InputStream from '../streams/input';
import type OutputStream from '../streams/output';

/**
 * Every child process has its own execution context that
 * expires when it is terminated or aborted.
 *
 * It exposes all neccessary features accessible to the
 * executed command
 */
export function createProcessContext(
    state: IState,
    input: InputStream,
    output: OutputStream,
    controller: AbortController
): IProcess {
    let done = false;

    const { signal } = controller;

    signal.addEventListener('abort', () => {
        done = true;
    });

    const stdin = {
        readline: () => (!done ? input.readline() : Promise.resolve(''))
    };

    const stdout = {
        clear: () => !done && output.clear(),
        write: (data: string) => {
            if (done) return;
            output.write(replaceEnvVariables(state.env, data));
        },
        writeln: (data: string) => stdout.write(`${data}\n`)
    };

    const stderr = {
        write: (msg: string) => {
            if (done) return;
            output.error(replaceEnvVariables(state.env, msg));
        },
        writeln: (data: string) => stderr.write(`${data}\n`)
    };

    return {
        cmd: '',
        args: '',
        argv: [],
        get env() {
            return state.env;
        },
        get stderr() {
            return stderr;
        },
        get stdin() {
            return stdin;
        },
        get stdout() {
            return stdout;
        },
        get history() {
            return state.history;
        },
        get version() {
            return VERSION;
        },
        get exitCode() {
            return toNumber(state.env[EXIT_CODE_ID]);
        },
        exit: (code?: number | string) => {
            controller.abort(code || PROCESS_TERMINATED);
        },
        onExit: (cb: (reason?: string) => void) => {
            signal.addEventListener('abort', () => {
                cb.call(undefined, signal.reason.toString());
            });
        }
    };
}
