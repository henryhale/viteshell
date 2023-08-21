import { parseArgs } from "./input";
import { parseCommand } from "./commands";
import { ParsedCommand } from "../interface";

export function parseInputIntoCommands(str: string): ParsedCommand[] {
    return parseArgs(str).map((args) => parseCommand(args));
}
