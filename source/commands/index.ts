import { isFunction, isObject } from "../helpers";
import type { ICommandConfig } from "../interface";

/**
 * Determine if the command configuration is right
 */
export function isCommandValid(
    config: ICommandConfig
): config is ICommandConfig {
    return (
        isObject(config) &&
        isFunction(config.action) &&
        !!config.description &&
        !!config.synopsis
    );
}
