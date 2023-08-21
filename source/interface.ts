/**
 * Type definitions for **viteshell**
 * Project: ViteShell
 * Definitions by Henry Hale (https://github.com/henryhale)
 */

/**
 * Result from parsing string input to argv object
 */
export type ParserResult = {
    /**
     * Error caught while parsing
     */
    error?: Error;

    /**
     * Array of raw arguments
     */
    args: string[];
};

/**
 * A single command and its respective arguments after parsing the input
 */
export type ParsedCommand = {
    cmd: string;
    argv: string[];
    PIPE?: ParsedCommand;
    AND?: ParsedCommand;
    OR?: ParsedCommand;
};

/**
 * Storable State
 */
export interface IState {
    readonly env: IEnv;
    readonly alias: IAlias;
    readonly history: string[];
}

export type IEnv = {
    SHELL: string;
    USERNAME: string;
    HOSTNAME: string;
    PWD: string;
    PS1: string;
    "?": number;
    RANDOM: number;
    [key: string]: string | number | undefined;
};

export type IAlias = {
    [key: string]: string | number | undefined;
};

/**
 * Shell State
 */
export interface IShellState extends IState {
    import(savedState: string): void;
    toJSON(): string;
    spawn(str?: string): IState;
    patch(mutatedState: IState): void;
}

/**
 * STDIN interface
 */
export interface StandardInput {
    readline(): Promise<string>;
}

/**
 * Input stream
 */
export interface InputStreamInterface extends StandardInput {
    readonly isBusy: boolean;
    insert(data?: string): void;
    clear(): void;
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
 * Output stream
 */
export interface OutputStreamInterface {
    bufferOutput: boolean;
    readonly extract: string[];
    onoutput?: OutputHandler;
    onerror?: OutputHandler;
    onclear?: () => void;
    beforeOutput?: (data: string) => string;
    write(data: OutputData, type?: OutputType): void;
    error(msg: OutputData): void;
    clear(): void;
    flush(): void;
    enable(): void;
    disable(): void;
    reset(): void;
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
     * Arguments to the command
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
     * Terminate the process
     */
    exit(): void;

    /**
     * Before exit hook
     */
    onExit(cb: () => void): void;

    /**
     * Exit code for the previously executed command
     */
    readonly exitCode: number;

    /**
     * Shell version number
     */
    readonly version: string;
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
    action(process: IProcess): void | number | Promise<void | number>;
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
     * @param str shell state backup as JSON string
     */
    public loadState(str: string): void;

    /**
     * Initializes the shell with a greeting and display the prompt
     * @param greeting The text to greet the user
     */
    public init(greeting?: string): void;

    /**
     * _[experimental]_
     *
     * Set command execution timeout beyond which the process is terminated
     */
    public setExecutionTimeout(value: number): void;

    /**
     * Check if the shell is busy waiting for user input
     */
    readonly isBusy: boolean;

    /**
     * Extracts a line from the input stream and executes it.
     *
     * If a command requires input, the input stream becomes busy until input is
     * made available via `shell.insert` method, until then this method can then
     * be invoked again for another input
     */
    public execute(): Promise<number | void>;

    /**
     * Aborts the current process or executing command
     */
    abort(reason?: unknown): void;

    // public executeScript(script: string): Promise<void>;

    // public use(plugin): void;

    /**
     * Shell version number
     */
    static readonly version: string;
}

export default ViteShell;
