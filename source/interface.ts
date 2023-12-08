/**
 * Type definitions for **viteshell**
 * Project: ViteShell
 * Definitions by Henry Hale (https://github.com/henryhale)
 */

/**
 * Environment Variables
 */
export type IEnv = {
    SHELL: string;
    USERNAME: string;
    HOSTNAME: string;
    PWD: string;
    PS1: string;
    PS2: string;
    "?": string;
    RANDOM: string;
    [key: string]: string | undefined;
};

/**
 * Aliases
 */
export type IAlias = {
    [key: string]: string | undefined;
};

/**
 * STDIN interface
 */
export interface StandardInput {
    readline(): Promise<string>;
}

/**
 * Data write in the output stream
 */
export type OutputData = string | number;

export type OutputHandler = (data: string) => void;

export type OutputType = "error" | "data";

/**
 * STDERR interface
 */
export interface StandardError {
    /**
     * Output data to the output stream
     * @param data The text to output
     */
    write(data: OutputData): void;
}

/**
 * STDOUT interface
 */
export interface StandardOutput extends StandardError {
    /**
     * Clear the entire output stream
     */
    clear(): void;
}

/**
 * Process object
 *
 * _Inspired by the `node:process` module_
 */
export type IProcess = {
    /**
     * The command being executed
     */
    cmd: string;

    /**
     * Raw arguments as a string
     */
    args: string;

    /**
     * Array of arguments to the command
     */
    argv: string[];

    /**
     * Current environment object
     */
    readonly env: IEnv;

    /**
     * STDIN interface
     */
    readonly stdin: StandardInput;

    /**
     * STDOUT interface
     */
    readonly stdout: StandardOutput;

    /**
     * STDERR interface
     */
    readonly stderr: StandardError;

    /**
     * History
     */
    readonly history: string[];

    /**
     * Shell version number
     */
    readonly version: string;

    /**
     * Exit code for the previously executed command
     */
    readonly exitCode: number;

    /**
     * Terminate the process
     */
    exit(code?: number | string): void;

    /**
     * Before exit hook
     */
    onExit(cb: (reason?: unknown) => void): void;
};

/**
 * Configuration for every new command
 */
export type ICommandConfig = {
    /**
     * Command's usage
     */
    synopsis: string;

    /**
     * Description of what the command does
     */
    description: string;

    /**
     * Executable function of the command
     */
    action(process: IProcess): Promise<void> | void;
};

/**
 * Name of the command
 */
export type ICommandName = string;

/**
 * A store of all commands for the shell
 *
 * _It is like the `bin` folder on Linux_
 */
export type ICommandLibrary = Map<ICommandName, ICommandConfig>;

/**
 * Plugin options
 */
// export interface PluginOptions {
//     install(state: IState): void;
//     beforeOutput(data: string): string;
//     onCommandSuccess(): void;
// }

/**
 * Create a new shell instance
 */
declare class ViteShell {
    /**
     * Store for command aliases
     */
    public readonly alias: IAlias;

    /**
     * Store for environment variables
     */
    public readonly env: IEnv;

    /**
     * An array of previously executed commands
     */
    public readonly history: string[];

    /**
     * Sets the function that will be invoked on every output request
     * throught the shell output stream
     */
    public onoutput: OutputHandler;

    /**
     * Sets a function invoked on every error write operation via the
     * output stream
     */
    public onerror: OutputHandler;

    /**
     * Sets a function invoked when the output stream is cleared
     */
    public onclear: () => void;

    /**
     * Adds a new command to the shell's bin box
     * @param name The name of the command
     * @param config The configuration of the command
     */
    public addCommand(name: ICommandName, config: ICommandConfig): void;

    /**
     * Removes a command from the shell's bin box
     * @param name The name of the command
     */
    public removeCommand(name: ICommandName): void;

    /**
     * Backups the shell state returning a JSON string
     */
    public exportState(): string;

    /**
     * Restores the shell state using a backup generated using `shell.exportState`
     * method
     * @param json shell state backup as JSON string
     */
    public loadState(json: string): void;

    /**
     * Initializes the shell with a greeting and display the prompt
     * @param greeting The text to greet the user
     */
    public init(greeting?: string): void;

    /**
     * Set command execution timeout beyond which the process is terminated
     */
    public setExecutionTimeout(value: number): void;

    /**
     * Extracts a line from the input stream and executes it.
     *
     * If a command requires input, the input stream becomes busy until input is
     * made available via `shell.insert` method, until then this method can then
     * be invoked again for another input
     */
    public execute(line?: string): Promise<void>;

    /**
     * Aborts the current process or executing command
     */
    public abort(reason?: unknown): void;

    // public executeScript(script: string): Promise<void>;

    // public use(plugin): void;

    /**
     * Shell version number
     */
    static readonly version: string;
}

export default ViteShell;
