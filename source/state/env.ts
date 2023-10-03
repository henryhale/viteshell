import { DEFAULT_PROMPT_STYLE, EXIT_SUCCESS, SHELL_NAME } from "../constants";
import { randomInt } from "../helpers";
import type { IEnv } from "../interface";

/**
 * Default Environment object
 */
const defaultEnv = {
    /**
     * Name of the shell
     */
    SHELL: SHELL_NAME,

    /**
     * The username of the current user
     */
    USERNAME: "user",

    /**
     * The device or host machine
     */
    HOSTNAME: "web",

    /**
     * Current working directory
     */
    CWD: "/",

    /**
     * Prompt style 1
     */
    PS1: "$USERNAME@$HOSTNAME: $CWD " + DEFAULT_PROMPT_STYLE,

    /**
     * Prompt style 2
     */
    PS2: "> ",

    /**
     * Previous exit status
     */
    "?": EXIT_SUCCESS,

    /**
     * Random number
     */
    RANDOM: randomInt()
};

/**
 * Create a new environment object with default variables
 * @returns Env
 */
export function defineEnv() {
    return Object.assign(Object.create(null), defaultEnv);
}

/**
 * Replaces all instances of environment variables with their respective values
 *
 * Example:
 *
 * ```js
 * const env = { USERNAME: "user", HOSTNAME: "web" };
 *
 * replaceEnvVariables(env, "$USERNAME@$HOSTNAME #")
 * // user@web #
 * ```
 *
 * @param env Environment object
 * @param data Template string
 * @returns complete string (without variable name slots)
 */
export function replaceEnvVariables(env: IEnv, data = ""): string {
    let match;
    return ("" + data).replace(/(?:\$([a-z_][a-z0-9_]+|\?))/gi, (x) => {
        match = env[x.slice(1)];
        if (typeof match === "undefined") {
            return "";
        }
        return match.toString();
    });
}
