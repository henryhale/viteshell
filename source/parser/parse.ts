import { delimiters } from "./lexer";

/**
 * A single command and its respective arguments after parsing the input
 *
 * - Abstract Syntax Tree to represent the input command
 */
export type ParsedCommand = {
    cmd: string;
    args: string;
    argv: string[];
    PIPE?: ParsedCommand;
    AND?: ParsedCommand;
    OR?: ParsedCommand;
};

/**
 * Creates a new command object
 */
function defineCommand(): ParsedCommand {
    return {
        cmd: "",
        args: "",
        argv: [],
        PIPE: undefined,
        AND: undefined,
        OR: undefined
    };
}

/**
 * Build up a command object from a list of arguments basing on the delimiters
 */
export function parseTokens(args: string[]): ParsedCommand {
    const c = defineCommand();

    c.cmd = args.shift() || "";

    const index = args.findIndex((v) => delimiters.slice(1).includes(v));

    if (index === -1) {
        c.argv = args.splice(0);
        c.args = (c.cmd + " " + c.argv.join(" ")).trim();
        return c;
    }

    c.argv = args.splice(0, index);
    c.args = (c.cmd + " " + c.argv.join(" ")).trim();

    if (args[0] === delimiters[1]) {
        c.PIPE = parseTokens(args.splice(1));
    }

    if (args[0] === delimiters[2]) {
        c.AND = parseTokens(args.splice(1));
    }

    if (args[0] === delimiters[3]) {
        c.OR = parseTokens(args.splice(1));
    }

    return c;
}
