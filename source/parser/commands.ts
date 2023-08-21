import type { ParsedCommand } from "../interface";
import { delimiters } from "./input";

/**
 * Creates a new command object
 */
function defineCommand(): ParsedCommand {
    return {
        cmd: "",
        argv: [],
        PIPE: undefined,
        AND: undefined,
        OR: undefined
    };
}

/**
 * Build up a command object from a list of arguments basing on the delimiters
 */
export function parseCommand(args: string[]): ParsedCommand {
    const c = defineCommand();

    c.cmd = args.shift() || "";

    const index = args.findIndex((v) => delimiters.slice(1).includes(v));

    if (index === -1) {
        c.argv = args.splice(0);
        return c;
    }

    c.argv = args.splice(0, index);

    if (args[0] === delimiters[1]) {
        c.PIPE = parseCommand(args.splice(1));
    }

    if (args[0] === delimiters[2]) {
        c.AND = parseCommand(args.splice(1));
    }

    if (args[0] === delimiters[3]) {
        c.OR = parseCommand(args.splice(1));
    }

    return c;
}
