import InputStream from "./input/index";
import OutputStream from "./output/index";
import ShellState from "./state/index";
import type Shell from "./interface";
import type {
    IAlias,
    ICommandName,
    ICommandConfig,
    ICommandLibrary,
    IEnv,
    IProcess,
    OutputHandler,
    ParsedCommand,
    StandardError,
    StandardInput,
    StandardOutput
} from "./interface";
import { replaceEnvVariables } from "./state/env";
import { createOpenPromise, isFunction, randomInt, toNumber } from "./helpers";
import {
    COMMAND_NOT_FOUND,
    EXIT_CODE_ID,
    EXIT_FAILURE,
    EXIT_SUCCESS,
    PROCESS_ABORTED,
    PROCESS_TERMINATED,
    PROMPT_STYLE_ID,
    RANDOM_ID,
    SHELL_INACTIVE,
    SHELL_NAME
} from "./constants";
import { isCommandValid } from "./commands/index";
import { parseInputIntoCommands } from "./parser/index";
import { addBuiltinCommands } from "./commands/builtin";
import {
    AbortSignalToken,
    createAbortablePromise,
    findNextCommand,
    matchVariable
} from "./executor/index";

const version = "v" + "__VERSION__";

export default class ViteShell implements Shell {
    #output: OutputStream;
    #input: InputStream;
    #state: ShellState;
    #bin: ICommandLibrary;
    #active: boolean;
    #abortSignal: AbortSignalToken;
    #timeout?: number;

    constructor() {
        this.#output = new OutputStream();
        this.#input = new InputStream();
        this.#state = new ShellState();
        this.#bin = new Map();
        this.#active = false;
        this.#abortSignal = new AbortSignalToken();
        this.#timeout = undefined;

        this.#output.beforeOutput = (data) => {
            return replaceEnvVariables(this.#state.env, data);
        };

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
            throw new TypeError("Output handler must be a function.");
        }
    }

    public set onerror(handler: OutputHandler) {
        if (isFunction(handler)) {
            this.#output.onerror = handler;
        } else {
            throw new TypeError("Error handler must be a function.");
        }
    }

    public set onclear(handler: () => void) {
        if (isFunction(handler)) {
            this.#output.onclear = handler;
        } else {
            throw new TypeError("Clear handler must be a function.");
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
        return this.#state.toJSON();
    }

    public loadState(str: string): void {
        this.#state.import(str);
    }

    public init(greeting = ""): void {
        if (this.#active) {
            return;
        }
        this.#active = true;
        this.#output.reset();
        this.#output.clear();
        if (greeting) {
            this.#output.write(greeting);
        }
        this.#output.write(this.env[PROMPT_STYLE_ID]);
    }

    public setExecutionTimeout(value: number): void {
        if (typeof value === "number" && value >= 0) {
            this.#timeout = value;
        }
    }

    public async execute(line?: string): Promise<void> {
        if (!this.#active) {
            return Promise.reject(SHELL_INACTIVE);
        }

        if (this.#input.isBusy) {
            this.#output.write(`${line || ""}\n`, "data", false);
            this.#input.insert(line);
            return;
        }

        if (typeof line !== "string" || !line.trim()) {
            this.#output.write(`${line || ""}\n`, "data", false);
            this.#output.write(this.env[PROMPT_STYLE_ID]);
            return;
        }

        // user input
        let input = line.trim();

        // write the input to the output stream
        this.#output.write(input + "\n", "data", false);

        // add input to history
        if (input != this.history.at(-1)) {
            this.history.push(input);
        }

        // check if it's a variable declaration
        const variable = matchVariable(input);
        if (variable) {
            const [, key, value] = variable;
            this.env[key] = value.trim();
            this.env[EXIT_CODE_ID] = EXIT_SUCCESS;
            return;
        }

        // replace all variables with their respective values
        input = replaceEnvVariables(this.env, input);

        // fork current state
        const spawnedState = this.#state.spawn();

        // replace variables before output
        this.#output.beforeOutput = (data) => {
            return replaceEnvVariables(spawnedState.env, data);
        };

        // create child process
        const child = createOpenPromise<void>();

        // reset abort token for reuse
        this.#abortSignal.reset();
        this.#abortSignal.onAbort(() => child.reject(PROCESS_ABORTED));

        // setup io interfaces
        const stdin: StandardInput = {
            readline: this.#input.readline.bind(this.#input)
        };
        const stdout: StandardOutput = {
            write: (data: string) =>
                !child.isComplete && this.#output.write(data),
            clear: () => !child.isComplete && this.#output.clear()
        };
        const stderr: StandardError = {
            write: (data: string) =>
                !child.isComplete && this.#output.error(data)
        };

        // setup a nodejs-like process object
        const process: IProcess = {
            cmd: "",
            argv: [],
            get stdin() {
                return stdin;
            },
            get stdout() {
                return stdout;
            },
            get stderr() {
                return stderr;
            },
            exit: () => {
                throw new Error(PROCESS_TERMINATED);
            },
            onExit: this.#abortSignal.onAbort.bind(this.#abortSignal),
            env: spawnedState.env,
            get exitCode() {
                return toNumber(spawnedState.env[EXIT_CODE_ID]);
            },
            get version() {
                return version;
            }
        };

        return await Promise.race([
            child.promise,
            createAbortablePromise(
                this.#abortSignal,
                async (resolve, reject) => {
                    let errorMsg: string | undefined;

                    const execute = async (c: ParsedCommand, p: IProcess) => {
                        // first check for alias - less parsing priority
                        const alias = this.alias[c.cmd];
                        if (alias) {
                            const args = alias.toString().split(" ");
                            c.cmd = args.shift() || "";
                            if (args.length) c.argv.unshift(...args);
                        }

                        // check if command exists
                        if (!this.#bin.has(c.cmd)) {
                            errorMsg = "'" + c.cmd + "' " + COMMAND_NOT_FOUND;
                        } else {
                            // update the process object
                            p.cmd = c.cmd;
                            p.argv = c.argv;

                            // whether to buffer the output or not
                            this.#output.bufferOutput = c.PIPE !== undefined;

                            try {
                                // execute command handler
                                await this.#bin
                                    .get(c.cmd)
                                    ?.action.call(undefined, p);
                            } catch (error) {
                                p.env[EXIT_CODE_ID] = EXIT_FAILURE;
                                errorMsg = error?.toString();
                            }
                        }

                        // no error, successful execution
                        const isOkay =
                            !errorMsg?.length &&
                            p.env[EXIT_CODE_ID] === EXIT_SUCCESS;

                        // pipe command
                        if (isOkay && c.PIPE) {
                            c.PIPE.argv.push(...this.#output.extract);
                            await execute(c.PIPE, p);
                            return;
                        }

                        if (c.AND || c.OR) {
                            const nxt = findNextCommand(c, isOkay);
                            if (nxt) {
                                if (errorMsg) {
                                    p.stderr.write("\n" + errorMsg);
                                    errorMsg = undefined;
                                }
                                await execute(nxt, p);
                            }
                        }
                    };

                    const commands = parseInputIntoCommands(input);

                    for (const command of commands) {
                        // prevent unnecessary runs
                        if (child.isComplete) break;
                        try {
                            // clear previous error
                            errorMsg = undefined;

                            // start the execution
                            await execute(command, process);

                            // check for any encountered error
                            if (errorMsg) {
                                throw errorMsg;
                            }

                            // record exit status
                            process.env[EXIT_CODE_ID] = EXIT_SUCCESS;
                        } catch (error) {
                            // failed
                            process.env[EXIT_CODE_ID] = EXIT_FAILURE;

                            // only print error and continue to the next command
                            if (commands.length > 1) {
                                process.stderr.write("\n" + error?.toString());
                            } else {
                                reject(error?.toString());
                                return;
                            }
                        }
                    }

                    // wow!! success...
                    resolve();
                },
                this.#timeout
            )
        ])
            .then(() => {
                // patch mutated state
                this.#state.patch(spawnedState);
            })
            .catch((error) => {
                // set exti status
                this.env[EXIT_CODE_ID] = EXIT_FAILURE;
                // print error
                this.#output.error("\n$SHELL: " + error?.toString());
            })
            .finally(() => {
                //  end the child process, just in case it hasn't been resolved yet
                child.resolve();
                // just to be sure
                this.#abortSignal.reset();
                // do the magic
                this.env[RANDOM_ID] = randomInt();
                // reset
                this.#output.beforeOutput = (data) => {
                    return replaceEnvVariables(this.#state.env, data);
                };
                this.#output.reset();
                // write prompt again
                this.#output.write(this.env[PROMPT_STYLE_ID]);
            });
    }

    public abort(reason?: unknown): void {
        this.#abortSignal.abort(reason);
    }

    static get version(): string {
        return version;
    }
}
