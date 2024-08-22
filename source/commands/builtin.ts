import { VERSION } from '../constants';
import { matchVariable } from '../executor/command';
import type { ICommandLibrary } from '../interface';
import type { IState } from '../state';

let onExitCallback: undefined | (() => void);

export function setExitHandler(fn: () => void) {
    onExitCallback = fn;
}

export function addBuiltinCommands(bin: ICommandLibrary, state: IState) {
    // exit
    bin.set('exit', {
        synopsis: 'exit',
        description: 'Terminate the current process',
        action: ({ exit }) => {
            onExitCallback?.call(undefined);
            exit();
        }
    });

    // clear
    bin.set('clear', {
        synopsis: 'clear',
        description: 'Clear the entire standard output stream.',
        action: ({ stdout }) => stdout.clear()
    });
    state.alias.cls = 'clear';

    // pwd
    bin.set('pwd', {
        synopsis: 'pwd',
        description: 'Print current working directory.',
        action: ({ stdout }) => stdout.writeln('$CWD')
    });

    // echo
    bin.set('echo', {
        synopsis: 'echo [...args]',
        description:
            'Write arguments to the standard output followed by a new line character.',
        action: ({ argv, stdout }) => stdout.writeln(argv.join(' '))
    });
    state.alias.print = 'echo';

    // alias
    bin.set('alias', {
        synopsis: 'alias [-p] [name=[value] ... ]',
        description: 'Defines aliases for commands',
        action: ({ argv, stdout }) => {
            if (!argv.length || argv.includes('-p')) {
                stdout.write('Aliases:');
                for (const alias of Object.entries(state.alias)) {
                    const [k, v] = alias;
                    stdout.write(`\n\talias ${k}='${v}'`);
                }
                stdout.write('\n');
            } else {
                for (const v of argv) {
                    const match = matchVariable(v);
                    if (match) {
                        const [, key, value] = match;
                        state.alias[key.trim()] = value.trim();
                    }
                }
            }
        }
    });

    // unalias
    bin.set('unalias', {
        synopsis: 'unalias [name ... ]',
        description: 'Removes aliases for commands',
        action: ({ argv }) => {
            if (!argv.length) return;
            for (const v of argv) {
                delete state.alias[v];
            }
        }
    });

    // export
    bin.set('export', {
        synopsis: 'export [-p] [name=[value] ... ]',
        description: 'Set shell variables by name and value',
        action: ({ argv, env, stdout }) => {
            if (!argv.length || argv.includes('-p')) {
                for (const entry of Object.entries(env)) {
                    const [k, v] = entry;
                    stdout.write(
                        `var ${k}=${`${v}`.split(/[\$]/).join('\\')}\n`
                    );
                }
            } else {
                for (const v of argv) {
                    const match = matchVariable(v);
                    if (match) {
                        const [, key, value] = match;
                        env[key.trim()] = value.trim();
                    }
                }
            }
        }
    });

    // history
    bin.set('history', {
        synopsis: 'history [-c] [-n]',
        description: 'Retrieve previous input entries',
        action: ({ argv, history, stdout }) => {
            if (argv.includes('-c')) {
                history.splice(0);
            } else if (argv.includes('-n')) {
                stdout.writeln(`History: ${history.length}`);
            } else {
                history.forEach((v, i) => {
                    stdout.writeln(`  ${i}\t${v}`);
                });
            }
        }
    });

    // help
    bin.set('help', {
        synopsis: 'help [command]',
        description: 'Displays information on available commands.',
        action: ({ argv, stdout }) => {
            if (argv[0]) {
                const cmdName = argv[0];
                const cmd = bin.get(cmdName);
                if (!cmd) {
                    throw `help: no information matching '${cmdName}'`;
                }
                const { synopsis, description } = cmd;
                stdout.writeln(`${cmdName}: ${synopsis}\n\t${description}`);
            } else {
                stdout.write(
                    `ViteShell, ${VERSION} Help\n\nA list of all available commands\n\n`
                );
                const all = Array.from(bin.values())
                    .map((v) => v.synopsis)
                    .sort();
                for (const v of all) {
                    stdout.writeln(v);
                }
            }
        }
    });
    state.alias.info = 'help';
    state.alias.man = 'help';

    // read
    bin.set('read', {
        synopsis: 'read [prompt] [variable]',
        description: 'Capture input and save it in the env object.',
        action: async ({ argv, env, stdin, stdout }) => {
            if (argv[0] && argv[1]) {
                stdout.write(argv[0]);
                env[argv[1]] = await stdin.readline();
            } else {
                throw 'invalid arguments: specify the prompt and variable name';
            }
        }
    });

    // sleep
    bin.set('sleep', {
        synopsis: 'sleep [seconds]',
        description: 'Delay for a specified amount of time (in seconds).',
        action: async ({ argv, onExit }) => {
            const t = Number.parseInt(argv[0], 10);
            if (Number.isNaN(t) || t <= 0) {
                throw 'invalid time specified (minimum is 1)';
            }
            await new Promise<void>((resolve) => {
                // eslint-disable-next-line prefer-const
                let id: unknown;
                onExit(() => {
                    clearTimeout(id as number);
                    id = null;
                    resolve();
                });
                id = setTimeout(() => resolve(), t * 1000);
            });
        }
    });

    // grep
    bin.set('grep', {
        synopsis: 'grep [keyword] [context ...]',
        description: 'Searches for matching phrases in the text',
        action: async ({ argv, stdout }) => {
            if (argv.length < 2) {
                throw 'invalid arguments';
            }
            const reg = new RegExp(argv[0], 'g');
            for (const x of argv.slice(1)) {
                if (reg.test(x)) {
                    stdout.writeln(x.replaceAll(argv[0], (m) => `**${m}**`));
                }
            }
        }
    });

    // date
    bin.set('date', {
        synopsis: 'date',
        description: 'Displays the current time and date',
        action: ({ stdout }) => stdout.writeln(new Date().toString())
    });
}
