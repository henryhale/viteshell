import { tokenize } from "./lexer";
import { parseTokens } from "./parse";
import type { ParsedCommand } from "./parse";

/**
 * Transform input string into commands
 */
export function parseInputIntoCommands(str: string): ParsedCommand[] {
    return tokenize(str).map((args) => parseTokens(args));
}
