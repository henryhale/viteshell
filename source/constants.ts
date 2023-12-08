/**
 * The version of the shell
 */
export const VERSION = "v" + "__VERSION__";

/**
 * The name of the shell
 *
 * _It is reflected in error messages_
 */
export const SHELL_NAME = "vsh";

/**
 * The shell identifier in the `env` object
 */
export const SHELL_NAME_ID = "SHELL";

/**
 * The exit code for successfully executed command
 */
export const EXIT_SUCCESS = "0";

/**
 * The exit code for commands resulting into errors when executed
 */
export const EXIT_FAILURE = "1";

/**
 * The previous exit code identifier in the `env` object
 */
export const EXIT_CODE_ID = "?";

/**
 * The prompt style identifier in the `env` object
 */
export const PROMPT_STYLE_ID = "PS1";

/**
 * The default prompt style in case there exist no prompt style
 * in the `env` object accessed via `PROMPT_STYLE_ID` key
 */
export const DEFAULT_PROMPT_STYLE = "$ ";

/**
 * Error message if the process is aborted
 */
export const PROCESS_ABORTED = SHELL_NAME + ": process aborted!";

/**
 * Error message if the process is aborted
 */
export const PROCESS_TIMED_OUT = SHELL_NAME + ": process timed out!";

/**
 * Error message if the command execution is voluntarily
 * terminated
 */
export const PROCESS_TERMINATED = SHELL_NAME + ": process terminated!";

/**
 * Error message if the command to execute does not exist
 * in the shell's `bin` object
 */
export const COMMAND_NOT_FOUND = "command not found";

/**
 * Random number identifier from the `env` object
 */
export const RANDOM_ID = "RANDOM";

/**
 * Error message if the shell is inactive
 */
export const SHELL_INACTIVE =
    SHELL_NAME + ": inactive, use shell.init() to activate";

/**
 * Minimum execution timeout
 */
export const MIN_TIMEOUT = 0;
