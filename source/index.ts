import { isCommandValid } from './commands';
import { addBuiltinCommands, setExitHandler } from './commands/builtin';
import {
    COMMAND_NOT_FOUND,
    EXIT_CODE_ID,
    EXIT_FAILURE,
    EXIT_SUCCESS,
    MIN_TIMEOUT,
    PROCESS_ABORTED,
    PROMPT_STYLE_ID,
    RANDOM_ID,
    SHELL_INACTIVE,
    SHELL_NAME,
    VERSION
} from './constants';
import { findNextCommand } from './executor';
import { createProcessContext } from './executor/process';
import { isFunction, randomInt } from './helpers';
import type Shell from './interface';
import type {
    IAlias,
    ICommandConfig,
    ICommandLibrary,
    ICommandName,
    IEnv,
    IProcess,
    OutputHandler
} from './interface';
import { parseInputIntoCommands } from './parser';
import type { ParsedCommand } from './parser/parse';
import { type IState, defineState, patchState, spawnState } from './state';
import { replaceEnvVariables } from './state/env';
import InputStream from './streams/input';
import OutputStream from './streams/output';
import { createAbortablePromise } from './util/promise';

/**
 * ViteShell
 */
export default class ViteShell implements Shell {
    #output: OutputStream;
    #input: InputStream;
    #state: IState;
    #bin: ICommandLibrary;
    #active: boolean;
    #abortController?: AbortController;
    #timeout?: number;

    constructor() {
        this.#output = new OutputStream();
        this.#input = new InputStream();
        this.#state = defineState();
        this.#bin = new Map();
        this.#active = false;
        this.#abortController = undefined;

        addBuiltinCommands(this.#bin, this.#state);
    }

    public get alias(): IAlias {
        return this.#state.alias;
    }

    public get env(): IEnv {
        return this.#state.env;
    }

    public get history(): string[] {
        return this.#state.history;
    }

    public set onoutput(handler: OutputHandler) {
        if (isFunction(handler)) {
            this.#output.onoutput = handler;
        } else {
            throw new TypeError(
                `${SHELL_NAME}: onoutput handler must be a function.`
            );
        }
    }

    public set onerror(handler: OutputHandler) {
        if (isFunction(handler)) {
            this.#output.onerror = handler;
        } else {
            throw new TypeError(
                `${SHELL_NAME}: onerror handler must be a function.`
            );
        }
    }

    public set onclear(handler: () => void) {
        if (isFunction(handler)) {
            this.#output.onclear = handler;
        } else {
            throw new TypeError(
                `${SHELL_NAME}: onclear handler must be a function.`
            );
        }
    }

    public set onexit(handler: () => void) {
        if (isFunction(handler)) {
            setExitHandler(handler);
        } else {
            throw new TypeError(
                `${SHELL_NAME}: onexit handler must be a function.`
            );
        }
    }

    public addCommand(name: ICommandName, config: ICommandConfig): void {
        if (this.#bin.has(name)) {
            throw new Error(
                `${SHELL_NAME}: '${name}' command already exists. If you are providing a custom command implementation, remove the command first.`
            );
        }

        if (!isCommandValid(config)) {
            throw new Error(`${SHELL_NAME}: invalid command configuration.`);
        }

        this.#bin.set(name, config);
    }

    public removeCommand(name: ICommandName): void {
        this.#bin.delete(name);
    }

    public listCommands(): string[] {
        return Array.from(this.#bin.keys());
    }

    public exportState(): string {
        return JSON.stringify(this.#state);
    }

    public loadState(json: string): void {
        this.#state = Object.assign(defineState(), spawnState(json));
    }

    #prompt() {
        this.env[RANDOM_ID] = `${randomInt()}`;
        this.#output.reset();
        this.#output.write(
            replaceEnvVariables(this.env, this.env[PROMPT_STYLE_ID])
        );
    }

    public reset(greeting = ''): void {
        this.#active = true;

        this.#input.reset();

        this.#output.clear();

        if (greeting) {
            const message = replaceEnvVariables(this.env, `${greeting}\n`);
            this.#output.write(message);
        }

        this.#prompt();
    }

    public setExecutionTimeout(value: number): void {
        if (typeof value === 'number' && value > MIN_TIMEOUT) {
            this.#timeout = value * 1000;
        } else {
            throw new TypeError(`${SHELL_NAME}: invalid value for timeout.`);
        }
    }

    async #execvp(c: ParsedCommand, p: IProcess): Promise<void> {
        // error message;
        let errorMsg = '';

        const next = async () => {
            // look for next executable command in the chain basing on exit status
            if (c.OR || c.AND) {
                const nxt = findNextCommand(c, !errorMsg.length);
                if (nxt) {
                    if (errorMsg.length) {
                        p.stderr.writeln(errorMsg);
                        errorMsg = '';
                    }
                    await this.#execvp(nxt, p);
                }
            }

            if (errorMsg.length) {
                throw errorMsg;
            }
        };

        // first check for alias - less parsing priority
        const alias = this.alias[c.cmd];
        if (alias) {
            const args = alias.split(' ');
            c.cmd = args.shift() || '';
            if (args.length) c.argv.unshift(...args);
            c.args = `${c.cmd} ${c.argv.join(' ')}`.trim();
        }

        // fetch command
        const command = this.#bin.get(c.cmd);

        // check if command is defined
        if (!command) {
            errorMsg = `${c.cmd}: ${COMMAND_NOT_FOUND}`;
            return await next();
        }

        // update the process object
        p.cmd = c.cmd;
        p.argv = c.argv;
        p.env[RANDOM_ID] = `${randomInt()}`;

        // whether to buffer the output or not
        this.#output.bufferOutput = c.PIPE !== undefined;

        try {
            // deactivate shell on `exit` command
            if (c.cmd === 'exit') {
                this.#active = false;
            }
            // execute command handler
            await command.action.call(undefined, p);
        } catch (error) {
            errorMsg = `${c.cmd}: error`;
        }

        // extract previous output for piped command
        if (c.PIPE) {
            c.PIPE.argv.push(...this.#output.extract);
            await this.#execvp(c.PIPE, p);
        }

        // next
        await next();
    }

    public async execute(line = ''): Promise<void> {
        // check if shell is initialized
        if (!this.#active) {
            return Promise.reject(SHELL_INACTIVE);
        }

        // incase there's a currently executing command requiring user input
        if (this.#input.isBusy) {
            this.#input.insert(line);
            return Promise.resolve();
        }
        // otherwise clear the input buffer and any input callback
        this.#input.reset();

        // flush the output stream and then activate it
        this.#output.reset();

        // check if the line contains characters
        if (typeof line !== 'string' || !line.trim()) {
            this.#prompt();
            return Promise.resolve();
        }

        const trimmedLine = line.trim();

        // add input to history, no consecutive duplicates
        if (trimmedLine !== this.history.at(-1)) {
            this.history.push(trimmedLine);
        }

        // fork current state
        const spawnedState = spawnState(this.#state);

        // reset abort token for reuse
        const controller = new AbortController();
        const signal = controller.signal;
        this.#abortController = controller;
        signal.addEventListener('abort', () => {
            this.#input.reset();
        });

        // setup a nodejs-like process object
        const process = createProcessContext(
            spawnedState,
            this.#input,
            this.#output,
            controller
        );

        // run child process in parallel with abort signal listener and timeout handler
        const promise = createAbortablePromise(
            controller,
            async (signal, reject) => {
                try {
                    // parse input
                    const commands = parseInputIntoCommands(trimmedLine);

                    for (const command of commands) {
                        // prevent unnecessary runs
                        if (signal.aborted) {
                            throw PROCESS_ABORTED;
                        }

                        try {
                            // execute command
                            await this.#execvp(command, process);
                            // update exit status
                            spawnedState.env[EXIT_CODE_ID] = EXIT_SUCCESS;
                            // update shell state
                            patchState(this.#state, spawnedState);
                        } catch (error) {
                            if (commands.length > 1) {
                                // only print error and continue to the next command
                                process.stderr.write(`${error}\n}`);
                                spawnedState.env[EXIT_CODE_ID] = EXIT_FAILURE;
                            } else {
                                throw error;
                            }
                        }
                    }
                    // successfully executed
                } catch (error) {
                    // handle error
                    reject(error?.toString());
                }
            },
            this.#timeout
        );

        return promise
            .catch((error) => {
                // print error
                this.#output.error(`${error}\n`);
                this.#state.env[EXIT_CODE_ID] = EXIT_FAILURE;
            })
            .finally(() => {
                // write prompt again
                this.#prompt();
            });
    }

    public abort(reason?: string): void {
        this.#abortController?.abort(reason || PROCESS_ABORTED);
    }

    static get version(): string {
        return VERSION;
    }
}
