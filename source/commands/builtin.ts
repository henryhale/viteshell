import { VERSION } from "../constants";
import { matchVariable } from "../executor/command";
import type { ICommandLibrary } from "../interface";
import type { IState } from "../state";

export function addBuiltinCommands(bin: ICommandLibrary, state: IState) {
    // exit
    bin.set("exit", {
        synopsis: "exit",
        description: "Terminate the current process",
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
        action: ({ stdout }) => stdout.writeln("$CWD")
    });

    // echo
    bin.set("echo", {
        synopsis: "echo [...args]",
        description:
            "Write arguments to the standard output followed by a new line character.",
        action: ({ argv, stdout }) => stdout.writeln(argv.join(" "))
    });

    // alias
    bin.set("alias", {
        synopsis: "alias [-p] [name=[value] ... ]",
        description: "Defines aliases for commands",
        action: ({ argv, stdout }) => {
            if (!argv.length || argv.includes("-p")) {
                stdout.write("Aliases:");
                Object.entries(state.alias).forEach(([k, v]) => {
                    stdout.write("\n\talias " + k + "='" + v + "'");
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
            stdout.write("\n");
        }
    });

    // unalias
    bin.set("unalias", {
        synopsis: "unalias [name ... ]",
        description: "Removes aliases for commands",
        action: ({ argv }) => {
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
        action: ({ argv, env, stdout }) => {
            if (!argv.length || argv.includes("-p")) {
                Object.entries(env).forEach(([k, v]) => {
                    stdout.write(
                        "var " +
                            k +
                            '="' +
                            (v?.toString().includes("$")
                                ? v.toString().split("").join("\\")
                                : v) +
                            '"\n'
                    );
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
        action: ({ argv, history, stdout }) => {
            if (argv.includes("-c")) {
                history.splice(0);
            } else if (argv.includes("-n")) {
                stdout.writeln(`History: ${history.length}`);
            } else {
                history.forEach((v, i) => {
                    stdout.writeln("  " + i + "\t" + v);
                });
            }
        }
    });

    // help
    bin.set("help", {
        synopsis: "help",
        description: "Displays information on available commands.",
        action: ({ argv, stdout }) => {
            if (argv[0]) {
                const cmd = bin.get(argv[0]);
                if (!cmd) {
                    throw "help: no information matching '" + cmd + "'";
                }
                const { synopsis, description } = cmd;
                stdout.write(cmd + ": " + synopsis + "\n\t" + description);
            } else {
                stdout.write(
                    `ViteShell, ${VERSION} Help\n\nA list of all available commands\n\n`
                );
                const all = Array.from(bin.values()).map((v) => v.synopsis);
                const longest = all.reduce((v, c) => {
                    return v > c.length ? v : c.length;
                }, 0);
                all.sort((a, b) => (a > b ? 1 : -1)).forEach((v, i) => {
                    stdout.write(v.padEnd(longest, " "));
                    stdout.write(i % 2 ? "\n" : "\t");
                });
            }
            stdout.write("\n");
        }
    });

    // read
    // wait
    // sleep
}
