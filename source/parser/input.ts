/**
 * Tokens that define the start/end of a command
 */
export const delimiters = [";", "|", "&&", "||"];

/**
 * Parse raw input into commands
 *
 * NB:
 * This is a customized version of the npm package:
 * [arrgv](https://github.com/astur/arrgv)
 *
 * @param str The raw input from the command line or script
 * @returns An array of commands and their arguments
 */
export function parseArgs(str: string): string[][] {
    const res: string[][] = [];

    if (!str || typeof str !== "string") return res;

    const tmp: string[] = [];

    let sQuoted = false;
    let dQuoted = false;
    let backSlash = false;
    let notEmpty = false;
    let buffer = "";

    let char!: string;

    if (delimiters.some((d) => str.startsWith((char = d)) || str.endsWith(d))) {
        throw new SyntaxError("unexpected token '" + char + "'");
    }

    str.split("").forEach((v, i, s) => {
        if (sQuoted && v === `'`) {
            sQuoted = false;
            notEmpty = true;
            return;
        }
        if (!sQuoted && !dQuoted && !backSlash) {
            if (v === `'`) {
                sQuoted = true;
                return;
            }
            if (v === '"') {
                dQuoted = true;
                return;
            }
            if (v === "\\") {
                backSlash = true;
                return;
            }
            if (["\b", "\f", "\n", "\r", "\t", " ", ";"].includes(v)) {
                if (buffer.length > 0 || notEmpty) {
                    tmp.push(buffer);
                    notEmpty = false;
                }
                if (v === ";" && tmp.length) {
                    res.push(tmp.splice(0));
                }
                buffer = "";
                return;
            }
        }
        if (!sQuoted && dQuoted && !backSlash && v === '"') {
            dQuoted = false;
            notEmpty = true;
            return;
        }
        if (!sQuoted && dQuoted && !backSlash && v === "\\") {
            backSlash = true;
            if (['"', "`", "$", "\\"].includes(s[i + 1])) {
                return;
            }
        }
        if (backSlash) {
            backSlash = false;
        }
        buffer += v;
    });

    if (buffer.length > 0 || notEmpty) {
        tmp.push(buffer);
        notEmpty = false;
    }

    if (tmp.length) res.push(tmp);

    if (dQuoted)
        throw new SyntaxError(
            "unexpected end of string while looking for matching double quote"
        );
    if (sQuoted)
        throw new SyntaxError(
            "unexpected end of string while looking for matching single quote"
        );
    if (backSlash)
        throw new SyntaxError("unexpected end of string right after slash");

    return res;
}
