import { parseArgs } from "../source/parser/input";
import { parseCommand } from "../source/parser/commands";
// import { parseInputIntoCommands } from "../source/parser";

const simpleCommand = "npm list -g --depth=0";
const multipleCommands =
    "echo 'searching...' ; cat file.txt | grep 'keyword' | sort && echo 'keyword found and sorted' || echo 'keyword not found'";

describe("Input Parsing", () => {
    test("simple commands", () => {
        const result = parseArgs(simpleCommand);
        expect(result).toBeInstanceOf(Array);
        expect(result).toStrictEqual([["npm", "list", "-g", "--depth=0"]]);
        expect(parseArgs("ls -l")).toStrictEqual([["ls", "-l"]]);
    });

    test("parsing errors", () => {
        expect(() => parseArgs("ls -l")).not.toThrowError();
        expect(() => parseArgs("ls -l; echo 1 ; echo 2")).not.toThrowError();
        expect(() => parseArgs(";ls -l")).toThrowError(/unexpected token ';'/g);
        expect(() => parseArgs("ls -l;")).toThrowError(/unexpected token ';'/g);
        expect(() => parseArgs("ls -l &&")).toThrowError(
            /unexpected token '&&'/g
        );
        expect(() => parseArgs("|| ls -l")).toThrowError(
            /unexpected token '\|'/g
        );
    });

    test("multiple commands", () => {
        const result = parseArgs(multipleCommands);

        expect(result).toBeInstanceOf(Array);
        expect(result).toStrictEqual([
            ["echo", "searching..."],
            [
                "cat",
                "file.txt",
                "|",
                "grep",
                "keyword",
                "|",
                "sort",
                "&&",
                "echo",
                "keyword found and sorted",
                "||",
                "echo",
                "keyword not found"
            ]
        ]);
    });
});

describe("Command Parsing", () => {
    test("simple commands", () => {
        const simple = parseArgs(simpleCommand);
        expect(simple).toBeInstanceOf(Array);
        expect(simple).toHaveLength(1);
        expect(simple[0]).toBeInstanceOf(Array);

        const result = parseCommand(simple[0]);

        expect(result).toBeDefined();
        expect(result).toEqual({
            cmd: "npm",
            argv: ["list", "-g", "--depth=0"],
            PIPE: undefined,
            AND: undefined,
            OR: undefined
        });
    });

    test("multiple commands", () => {
        const multiple = parseArgs(multipleCommands);

        expect(multiple).toBeInstanceOf(Array);
        expect(multiple).toHaveLength(2);

        let result = parseCommand(multiple[0]);

        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(Object);
        expect(result).toEqual({
            cmd: "echo",
            argv: ["searching..."],
            PIPE: undefined,
            AND: undefined,
            OR: undefined
        });

        result = parseCommand(multiple[1]);
        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(Object);
        expect(result).toEqual({
            cmd: "cat",
            argv: ["file.txt"],
            PIPE: {
                cmd: "grep",
                argv: ["keyword"],
                PIPE: {
                    cmd: "sort",
                    argv: [],
                    PIPE: undefined,
                    AND: {
                        cmd: "echo",
                        argv: ["keyword found and sorted"],
                        PIPE: undefined,
                        AND: undefined,
                        OR: {
                            cmd: "echo",
                            argv: ["keyword not found"]
                        }
                    },
                    OR: undefined
                },
                AND: undefined,
                OR: undefined
            },
            AND: undefined,
            OR: undefined
        });
    });
});
