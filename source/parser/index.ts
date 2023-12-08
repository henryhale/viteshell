import { tokenize } from "./lexer";
import { parseTokens } from "./parse";
import type { ParsedCommand } from "./parse";

export function parseInputIntoCommands(str: string): ParsedCommand[] {
    return tokenize(str).map((args) => parseTokens(args));
}
