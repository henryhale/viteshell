import { findNextCommand, matchVariable } from "../source/executor/index";
import { createAbortablePromise } from "../source/util/index";
import { parseInputIntoCommands } from "../source/parser/index";

jest.useFakeTimers();

describe("Variable parsing helpers", () => {
    test("matching variable declarations", () => {
        const input = "key=value";
        const result = matchVariable(input);
        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(Array);

        const [, key, value] = result as string[];

        expect(key).toEqual("key");
        expect(value).toEqual("value");
    });

    test("variable naming", () => {
        let result = matchVariable("_key=123");
        expect(result).toBeInstanceOf(Array);

        result = matchVariable("BIGKEY=123");
        expect(result).toBeInstanceOf(Array);

        result = matchVariable("321=123");
        expect(result).toBeInstanceOf(Array);

        result = matchVariable("key = value");
        expect(result).toBeNull();
    });
});

describe("Next command lookup", () => {
    test("searching for the next command", () => {
        const c = parseInputIntoCommands(
            "npm i && npm run dev || echo 'setup failed!'"
        )[0];

        expect(c).toEqual({
            cmd: "npm",
            args: "npm i",
            argv: ["i"],
            PIPE: undefined,
            AND: {
                cmd: "npm",
                args: "npm run dev",
                argv: ["run", "dev"],
                PIPE: undefined,
                AND: undefined,
                OR: {
                    cmd: "echo",
                    args: "echo setup failed!",
                    argv: ["setup failed!"],
                    PIPE: undefined,
                    AND: undefined,
                    OR: undefined
                }
            },
            OR: undefined
        });

        // execution status
        let status: boolean;

        // suppose `npm i` succeeds
        status = true;
        expect(findNextCommand(c, status)).toEqual({
            cmd: "npm",
            args: "npm run dev",
            argv: ["run", "dev"],
            PIPE: undefined,
            AND: undefined,
            OR: {
                cmd: "echo",
                args: "echo setup failed!",
                argv: ["setup failed!"],
                PIPE: undefined,
                AND: undefined,
                OR: undefined
            }
        });

        // suppose `npm i` fails
        status = false;
        expect(findNextCommand(c, status)).toEqual({
            cmd: "echo",
            args: "echo setup failed!",
            argv: ["setup failed!"],
            PIPE: undefined,
            AND: undefined,
            OR: undefined
        });
    });
});

describe("Abortable promise", () => {
    let controller: AbortController;
    let signal: AbortSignal;

    beforeEach(() => {
        controller = new AbortController();
        signal = controller.signal;
    });

    test("creating promises", () => {
        expect(createAbortablePromise(() => 1, controller)).toBeInstanceOf(
            Promise
        );
        expect(
            createAbortablePromise((resolve) => resolve(1), controller)
        ).resolves.toEqual(1);
    });

    test("errors", () => {
        expect(
            createAbortablePromise(() => {
                throw new Error("some error");
            }, controller)
        ).rejects.toBeInstanceOf(Error);
    });

    test("manually aborted", async () => {
        expect(
            createAbortablePromise((resolve) => {
                const id = setTimeout(() => {
                    resolve("success");
                }, 1500);
                signal.addEventListener("abort", () => clearTimeout(id));
            }, controller)
        ).rejects.toMatch(/aborted/g);
        setTimeout(() => controller.abort(), 500);
    });

    // TODO
    // test("timed promise", () => {
    // });
});
