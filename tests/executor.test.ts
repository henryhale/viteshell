import { findNextCommand, matchVariable } from "../source/executor/index";
import {
    createAbortablePromise,
    createAbortSignal
} from "../source/util/index";
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

describe("Abort signal token", () => {
    test("usage", () => {
        const signal = createAbortSignal();

        expect(signal).toHaveProperty("abort");
        expect(signal).toHaveProperty("onAbort");
        expect(signal).toHaveProperty("reset");
        expect(signal).toHaveProperty("isAborted");

        let reason!: string;

        signal.onAbort((r) => (reason = r as string));

        expect(signal["isAborted"]).toBeFalsy();

        signal.abort("error: aborted");

        expect(reason).toEqual("error: aborted");

        expect(signal["isAborted"]).toBeTruthy();

        signal.reset();

        expect(signal["isAborted"]).toBeFalsy();
    });
});

describe("Abortable promise", () => {
    const signal = createAbortSignal();

    beforeEach(() => signal.reset());

    test("creating promises", () => {
        expect(createAbortablePromise(signal, () => 1)).toBeInstanceOf(Promise);
        expect(
            createAbortablePromise(signal, (resolve) => {
                resolve(1);
            })
        ).resolves.toEqual(1);
    });

    test("errors", () => {
        expect(
            createAbortablePromise(signal, () => {
                throw new Error("some error");
            })
        ).rejects.toBe("Error: some error");
    });

    test("manually aborted", async () => {
        expect(
            createAbortablePromise(signal, (resolve) => {
                const id = setTimeout(() => {
                    resolve("success");
                }, 1500);
                signal.onAbort(() => clearTimeout(id));
            })
        ).rejects.toMatch(/aborted/g);
        setTimeout(() => signal.abort(), 500);
    });

    test("timed promise", () => {
        expect(
            createAbortablePromise(
                signal,
                (resolve) => {
                    const id = setTimeout(() => resolve("success"), 500);
                    signal.onAbort(() => clearTimeout(id));
                },
                1000
            )
        ).resolves.toMatch(/success/g);

        expect(
            createAbortablePromise(
                signal,
                (resolve) => {
                    const id = setTimeout(() => resolve("success"), 1000);
                    signal.onAbort(() => clearTimeout(id));
                },
                500
            )
        ).resolves.toMatch(/timed out/g);

        expect(
            createAbortablePromise(
                signal,
                () => {
                    throw new Error("some error");
                },
                1000
            )
        ).rejects.toMatch(/some error/g);
    });
});
