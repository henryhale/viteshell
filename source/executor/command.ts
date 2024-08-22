import type { ParsedCommand } from '../parser/parse';

/**
 * Check whether the string matchs a key=value format
 *
 * If so, return a list of matches
 *
 * Otherwise null
 */
export function matchVariable(str: string): null | string[] {
    return str.match(/^([a-zA-Z0-9_]+)=(.*)$/);
}

/**
 * Find next command to execute basing on previous command execution status
 */
export function findNextCommand(
    c: ParsedCommand | undefined,
    status: boolean
): ParsedCommand | undefined {
    if (!c) return undefined;

    if (status && c.AND) return c.AND;

    if (!status && c.OR) return c.OR;

    return findNextCommand(c.AND, status) || findNextCommand(c.OR, status);
}
