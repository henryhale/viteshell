import { matchVariable } from "../executor/command";
import { ICommandConfig, ICommandLibrary, IState } from "../interface";

export function addBuiltinCommands(bin: ICommandLibrary, state: IState) {
    // exit
    bin.set("exit", {
        synopsis: "exit",
        description: "Terminate current process",
        action: ({ exit }) => exit()
    });

    // clear
    bin.set("clear", {
        synopsis: "clear",
        description: "Clear the entire standard output stream.",
        action: ({ stdout }) => stdout.clear()
    });

    // pwd
    bin.set("pwd", {
        synopsis: "pwd",
        description: "Print current working directory.",
        action: ({ stdout }) => stdout.write("\n$PWD")
    });

    // echo
    bin.set("echo", {
        synopsis: "echo [...args]",
        description:
            "Write arguments to the standard output followed by a new line character.",
        action({ argv, stdout }) {
            argv.forEach((v) => stdout.write(v));
            stdout.write("\n");
        }
    });

    // alias
    bin.set("alias", {
        synopsis: "alias [-p] [name=[value] ... ]",
        description: "Defines aliases for commands",
        action({ argv, stdout }) {
            if (!argv.length || argv.includes("-p")) {
                Object.entries(state.alias).forEach(([k, v]) => {
                    stdout.write("\nalias " + k + "='" + v + "'");
                });
            } else {
                argv.forEach((v) => {
                    const match = matchVariable(v);
                    if (match) {
                        const [, key, value] = match;
                        state.alias[key.trim()] = value.trim();
                    }
                });
            }
        }
    });

    // unalias
    bin.set("unalias", {
        synopsis: "unalias [name=[value] ... ]",
        description: "Removes aliases for commands",
        action({ argv }) {
            if (!argv.length) return;
            argv.forEach((v) => {
                delete state.alias[v];
            });
        }
    });

    // export
    bin.set("export", {
        synopsis: "export [name=[value] ... ]",
        description: "Set shell variables by name and value",
        action({ argv, env, stdout }) {
            if (!argv.length || argv.includes("-p")) {
                Object.entries(env).forEach(([k, v]) => {
                    stdout.write("\nvar " + k + "\t" + v);
                });
            } else {
                argv.forEach((v) => {
                    const match = matchVariable(v);
                    if (match) {
                        const [, key, value] = match;
                        env[key.trim()] = value.trim();
                    }
                });
            }
        }
    });

    // history
    bin.set("history", {
        synopsis: "history [-c] [-n]",
        description: "Retrieve previous input entries",
        action: ({ argv, stdout }) => {
            if (argv.includes("-c")) {
                state.history.splice(0);
            } else if (argv.includes("-n")) {
                stdout.write(`\nHistory: ${state.history.length}`);
            } else {
                state.history.forEach((v, i) => {
                    stdout.write("\n " + i + " " + v);
                });
            }
        }
    });

    // help
    bin.set("help", {
        synopsis: "help",
        description: "Displays information on available commands.",
        action({ argv, stdout }) {
            if (argv[0]) {
                const cmd = argv[0];
                if (!bin.has(cmd)) {
                    throw "help: no information matching '" + cmd + "'";
                }
                const { synopsis, description } = bin.get(
                    cmd
                ) as ICommandConfig;
                stdout.write(
                    "\n" + cmd + ": " + synopsis + "\n\t" + description
                );
            } else {
                bin.forEach((v) => stdout.write("\n" + v.synopsis));
            }
        }
    });

    // read
    // wait
    // sleep
}
