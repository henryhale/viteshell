import { tokenize } from '../source/parser/lexer';
import { parseTokens } from '../source/parser/parse';

const simpleCommand = 'npm list -g --depth=0';
const multipleCommands =
    "echo 'searching...' ; cat file.txt | grep 'keyword' | sort && echo 'keyword found and sorted' || echo 'keyword not found'";

describe('Input Parsing', () => {
    test('simple commands', () => {
        const result = tokenize(simpleCommand);
        expect(result).toBeInstanceOf(Array);
        expect(result).toStrictEqual([['npm', 'list', '-g', '--depth=0']]);
        expect(tokenize('ls -l')).toStrictEqual([['ls', '-l']]);
    });

    test('parsing errors', () => {
        expect(() => tokenize('ls -l')).not.toThrowError();
        expect(() => tokenize('ls -l; echo 1 ; echo 2')).not.toThrowError();
        expect(() => tokenize(';ls -l')).toThrowError(/unexpected token ';'/g);
        expect(() => tokenize('ls -l;')).toThrowError(/unexpected token ';'/g);
        expect(() => tokenize('ls -l &&')).toThrowError(
            /unexpected token '&&'/g
        );
        expect(() => tokenize('|| ls -l')).toThrowError(
            /unexpected token '\|'/g
        );
    });

    test('multiple commands', () => {
        const result = tokenize(multipleCommands);

        expect(result).toBeInstanceOf(Array);
        expect(result).toStrictEqual([
            ['echo', 'searching...'],
            [
                'cat',
                'file.txt',
                '|',
                'grep',
                'keyword',
                '|',
                'sort',
                '&&',
                'echo',
                'keyword found and sorted',
                '||',
                'echo',
                'keyword not found'
            ]
        ]);
    });
});

describe('Command Parsing', () => {
    test('simple commands', () => {
        const simple = tokenize(simpleCommand);
        expect(simple).toBeInstanceOf(Array);
        expect(simple).toHaveLength(1);
        expect(simple[0]).toBeInstanceOf(Array);

        const result = parseTokens(simple[0]);

        expect(result).toBeDefined();
        expect(result).toEqual({
            cmd: 'npm',
            args: 'npm list -g --depth=0',
            argv: ['list', '-g', '--depth=0'],
            PIPE: undefined,
            AND: undefined,
            OR: undefined
        });
    });

    test('multiple commands', () => {
        const multiple = tokenize(multipleCommands);

        expect(multiple).toBeInstanceOf(Array);
        expect(multiple).toHaveLength(2);

        let result = parseTokens(multiple[0]);

        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(Object);
        expect(result).toEqual({
            cmd: 'echo',
            args: 'echo searching...',
            argv: ['searching...'],
            PIPE: undefined,
            AND: undefined,
            OR: undefined
        });

        result = parseTokens(multiple[1]);
        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(Object);
        expect(result).toEqual({
            cmd: 'cat',
            args: 'cat file.txt',
            argv: ['file.txt'],
            PIPE: {
                cmd: 'grep',
                args: 'grep keyword',
                argv: ['keyword'],
                PIPE: {
                    cmd: 'sort',
                    args: 'sort',
                    argv: [],
                    PIPE: undefined,
                    AND: {
                        cmd: 'echo',
                        args: 'echo keyword found and sorted',
                        argv: ['keyword found and sorted'],
                        PIPE: undefined,
                        AND: undefined,
                        OR: {
                            cmd: 'echo',
                            args: 'echo keyword not found',
                            argv: ['keyword not found']
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
