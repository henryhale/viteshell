import InputStream from "./streams/input";
import OutputStream from "./streams/output";
import type Shell from "./interface";
import { replaceEnvVariables } from "./state/env";
import { isFunction, randomInt } from "./helpers";
import type {
    IAlias,
    ICommandName,
    ICommandConfig,
    ICommandLibrary,
    IEnv,
    IProcess,
    OutputHandler
} from "./interface";
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
} from "./constants";
import { isCommandValid } from "./commands";
import { addBuiltinCommands } from "./commands/builtin";
import { parseInputIntoCommands } from "./parser";
import type { ParsedCommand } from "./parser/parse";
import {
    type IAbortSignal,
    createAbortSignal,
    createAbortablePromise,
    findNextCommand,
    createProcessContext
} from "./executor";
import { defineState, spawnState, type IState, patchState } from "./state";

/**
 * ViteShell
 */
export default class ViteShell implements Shell {
    #output: OutputStream;
    #input: InputStream;
    #state: IState;
    #bin: ICommandLibrary;
    #active: boolean;
    #abortSignal: IAbortSignal;
    #timeout?: number;

    constructor() {
        this.#output = new OutputStream();
        this.#input = new InputStream();
        this.#state = defineState();
        this.#bin = new Map();
        this.#active = false;
        this.#abortSignal = createAbortSignal();

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
            throw new TypeError("onoutput handler must be a function.");
        }
    }

    public set onerror(handler: OutputHandler) {
        if (isFunction(handler)) {
            this.#output.onerror = handler;
        } else {
            throw new TypeError("onerror handler must be a function.");
        }
    }

    public set onclear(handler: () => void) {
        if (isFunction(handler)) {
            this.#output.onclear = handler;
        } else {
            throw new TypeError("onclear handler must be a function.");
        }
    }

    public addCommand(name: ICommandName, config: ICommandConfig): void {
        if (this.#bin.has(name)) {
            throw new Error(`${SHELL_NAME}: '${name}' command already exists`);
        }

        if (!isCommandValid(config)) {
            throw new Error(`${SHELL_NAME}: invalid command configuration`);
        }

        this.#bin.set(name, config);
    }

    public removeCommand(name: ICommandName): void {
        this.#bin.delete(name);
    }

    public exportState(): string {
        return JSON.stringify(this.#state);
    }

    public loadState(json: string): void {
        this.#state = Object.assign(defineState(), spawnState(json));
    }

    #prompt() {
        this.env[RANDOM_ID] = "" + randomInt();
        this.#abortSignal.reset();
        this.#output.reset();
        this.#output.write(
            replaceEnvVariables(this.env, this.env[PROMPT_STYLE_ID])
        );
    }

    public init(greeting = ""): void {
        if (this.#active) {
            return;
        }
        this.#active = true;

        this.#output.clear();

        if (greeting) {
            greeting = replaceEnvVariables(this.env, greeting + "\n");
            this.#output.write(greeting);
        }

        this.#prompt();
    }

    public setExecutionTimeout(value: number): void {
        if (typeof value === "number" && value >= MIN_TIMEOUT) {
            this.#timeout = value;
        }
    }

    async #execvp(c: ParsedCommand, p: IProcess): Promise<void> {
        // first check for alias - less parsing priority
        const alias = this.alias[c.cmd];
        if (alias) {
            const args = alias.split(" ");
            c.cmd = args.shift() || "";
            if (args.length) c.argv.unshift(...args);
            c.args = (c.cmd + " " + c.argv.join(" ")).trim();
        }

        // fetch command
        const command = this.#bin.get(c.cmd);

        // check if command is defined
        if (!command) {
            throw c.cmd + ": " + COMMAND_NOT_FOUND;
        }

        // update the process object
        p.cmd = c.cmd;
        p.argv = c.argv;
        p.env[RANDOM_ID] = "" + randomInt();

        // whether to buffer the output or not
        this.#output.bufferOutput = c.PIPE !== undefined;

        try {
            // execute command handler
            await command.action.call(undefined, p);
            p.env[EXIT_CODE_ID] = EXIT_SUCCESS;
            if (c.PIPE) {
                c.PIPE.argv.push(...this.#output.extract);
                await this.#execvp(c.PIPE, p);
            }
        } catch (error) {
            p.env[EXIT_CODE_ID] = EXIT_FAILURE;
            if (error) p.stderr.write("" + error);
        } finally {
            if (c.OR || c.AND) {
                const status = p.env[EXIT_CODE_ID] === EXIT_SUCCESS;
                const nxt = findNextCommand(c, status);
                if (nxt) await this.#execvp(nxt, p);
            }
        }
    }

    public async execute(line: string = ""): Promise<void> {
        if (!this.#active) {
            return Promise.reject(SHELL_INACTIVE);
        }

        this.#output.reset();

        // incase there's a currently executing command requiring user input
        if (this.#input.isBusy) {
            this.#input.insert(line);
            return Promise.resolve();
        }

        if (typeof line !== "string" || !line.trim()) {
            this.#prompt();
            return Promise.resolve();
        }

        line = line.trim();

        // add input to history
        if (line != this.history.at(-1)) {
            this.history.push(line);
        }

        // fork current state
        const spawnedState = spawnState(this.#state);

        // reset abort token for reuse
        this.#abortSignal.reset();

        // setup a nodejs-like process object
        const process = createProcessContext(
            spawnedState,
            this.#input,
            this.#output,
            this.#abortSignal
        );

        return await createAbortablePromise<void>(
            this.#abortSignal,
            async (resolve, reject) => {
                try {
                    // parse input
                    const commands = parseInputIntoCommands(line);

                    for (const command of commands) {
                        // prevent unnecessary runs
                        if (this.#abortSignal.isAborted) throw PROCESS_ABORTED;
                        try {
                            // execute command
                            await this.#execvp(command, process);
                            // update shell state
                            patchState(this.#state, spawnedState);
                        } catch (error) {
                            if (commands.length > 1) {
                                // only print error and continue to the next command
                                process.stderr.write("\n" + error);
                                spawnedState.env[EXIT_CODE_ID] = EXIT_FAILURE;
                            } else {
                                throw error;
                            }
                        }
                    }
                    resolve();
                } catch (error) {
                    reject(error);
                }
            },
            this.#timeout
        )
            .catch((error) => {
                this.#output.error("\n" + error);
                this.#state.env[EXIT_CODE_ID] = EXIT_FAILURE;
            })
            .finally(() => {
                // write prompt again
                this.#prompt();
            });
    }

    public abort(reason?: unknown): void {
        this.#abortSignal.abort(reason);
    }

    static get version(): string {
        return VERSION;
    }
}
