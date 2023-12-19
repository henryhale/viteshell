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
    state.alias["cls"] = "clear";

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
    state.alias["print"] = "echo";

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
                stdout.write("\n");
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
        synopsis: "export [-p] [name=[value] ... ]",
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
        synopsis: "help [command]",
        description: "Displays information on available commands.",
        action: ({ argv, stdout }) => {
            if (argv[0]) {
                const cmdName = argv[0];
                const cmd = bin.get(cmdName);
                if (!cmd) {
                    throw "help: no information matching '" + cmdName + "'";
                }
                const { synopsis, description } = cmd;
                stdout.writeln(
                    cmdName + ": " + synopsis + "\n\t" + description
                );
            } else {
                stdout.write(
                    "ViteShell, " +
                        VERSION +
                        " Help\n\nA list of all available commands\n\n"
                );
                Array.from(bin.values())
                    .map((v) => v.synopsis)
                    .sort()
                    .forEach((v) => stdout.writeln(v));
            }
        }
    });
    state.alias["info"] = "help";
    state.alias["man"] = "help";

    // read
    bin.set("read", {
        synopsis: "read [prompt] [variable]",
        description: "Capture input and save it in the env object.",
        action: async ({ argv, env, stdin, stdout }) => {
            if (argv[0] && argv[1]) {
                stdout.write(argv[0]);
                env[argv[1]] = await stdin.readline();
            } else {
                throw "invalid arguments: specify the prompt and variable name";
            }
        }
    });

    // sleep
    bin.set("sleep", {
        synopsis: "sleep [seconds]",
        description: "Delay for a specified amount of time (in seconds).",
        action: async ({ argv }) => {
            const t = parseInt(argv[0], 10);
            if (isNaN(t) || t <= 0) {
                throw "invalid time specified (minimum is 1)";
            }
            await new Promise<void>((resolve) =>
                setTimeout(() => resolve(), t * 1000)
            );
        }
    });

    // grep
    bin.set("grep", {
        synopsis: "grep [keyword] [context ...]",
        description: "Searches for matching phrases in the text",
        action: async ({ argv, stdout }) => {
            if (argv.length < 2) {
                throw "invalid arguments";
            }
            const reg = new RegExp(argv[0], "g");
            argv.slice(1).forEach((x) => {
                if (reg.test(x)) {
                    stdout.writeln(
                        x.replaceAll(argv[0], (m) => "**" + m + "**")
                    );
                }
            });
        }
    });
}
