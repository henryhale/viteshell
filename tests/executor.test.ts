import { PROCESS_ABORTED, PROCESS_TIMED_OUT } from '../source/constants';
import { findNextCommand, matchVariable } from '../source/executor/index';
import { parseInputIntoCommands } from '../source/parser/index';
import { createAbortablePromise } from '../source/util/index';

jest.useFakeTimers();

describe('Variable parsing helpers', () => {
    test('matching variable declarations', () => {
        const input = 'key=value';
        const result = matchVariable(input);
        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(Array);

        const [, key, value] = result as string[];

        expect(key).toEqual('key');
        expect(value).toEqual('value');
    });

    test('variable naming', () => {
        let result = matchVariable('_key=123');
        expect(result).toBeInstanceOf(Array);

        result = matchVariable('BIGKEY=123');
        expect(result).toBeInstanceOf(Array);

        result = matchVariable('321=123');
        expect(result).toBeInstanceOf(Array);

        result = matchVariable('key = value');
        expect(result).toBeNull();
    });
});

describe('Next command lookup', () => {
    test('searching for the next command', () => {
        const c = parseInputIntoCommands(
            "npm i && npm run dev || echo 'setup failed!'"
        )[0];

        expect(c).toEqual({
            cmd: 'npm',
            args: 'npm i',
            argv: ['i'],
            PIPE: undefined,
            AND: {
                cmd: 'npm',
                args: 'npm run dev',
                argv: ['run', 'dev'],
                PIPE: undefined,
                AND: undefined,
                OR: {
                    cmd: 'echo',
                    args: 'echo setup failed!',
                    argv: ['setup failed!'],
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
            cmd: 'npm',
            args: 'npm run dev',
            argv: ['run', 'dev'],
            PIPE: undefined,
            AND: undefined,
            OR: {
                cmd: 'echo',
                args: 'echo setup failed!',
                argv: ['setup failed!'],
                PIPE: undefined,
                AND: undefined,
                OR: undefined
            }
        });

        // suppose `npm i` fails
        status = false;
        expect(findNextCommand(c, status)).toEqual({
            cmd: 'echo',
            args: 'echo setup failed!',
            argv: ['setup failed!'],
            PIPE: undefined,
            AND: undefined,
            OR: undefined
        });
    });
});

describe('Abortable promise', () => {
    let controller: AbortController;

    beforeEach(() => {
        controller = new AbortController();
    });

    test('creating promises', () => {
        expect(
            createAbortablePromise(controller, async () => void 0)
        ).toBeInstanceOf(Promise);
    });

    test('errors', () => {
        expect(
            createAbortablePromise(
                controller,
                async (_, reject): Promise<void> => {
                    try {
                        throw new Error('some error');
                    } catch (error) {
                        reject(error);
                    }
                }
            )
        ).rejects.toBeInstanceOf(Error);
    });

    test('manually aborted', async () => {
        expect(
            createAbortablePromise(controller, (signal) => {
                return new Promise<void>((resolve) => {
                    const id = setTimeout(() => resolve(), 1500);
                    signal.addEventListener('abort', () => clearTimeout(id));
                });
            })
        ).rejects.toMatch(PROCESS_ABORTED);
        setTimeout(() => controller.abort(), 500);
    });

    test('timed promise', () => {
        expect(
            createAbortablePromise(
                controller,
                (signal) => {
                    return new Promise<void>((resolve) => {
                        const id = setTimeout(() => resolve(), 1000);
                        signal.addEventListener('abort', () =>
                            clearTimeout(id)
                        );
                    });
                },
                500
            )
        ).rejects.toMatch(PROCESS_TIMED_OUT);
    });
});
