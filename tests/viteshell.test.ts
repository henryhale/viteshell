import ViteShell from "../source/index";
import type { IProcess } from "../source/interface";

describe("ViteShell", () => {
    test("shell version is defined", () => {
        expect(ViteShell).toBeDefined();
        expect(ViteShell.version).toBeDefined();
    });

    let shell: ViteShell;

    beforeEach(() => {
        shell = new ViteShell();
    });

    test("initialization", () => {
        expect(shell).toBeDefined();
        expect(shell.alias).toBeDefined();
        expect(shell.env).toBeDefined();
        expect(shell.history).toBeInstanceOf(Array);

        expect(shell.onoutput).toBeUndefined();
        expect(shell.onerror).toBeUndefined();
        expect(shell.onclear).toBeUndefined();
    });

    test("shell state properties", () => {
        shell.alias["print"] = "echo";
        expect(Object.keys(shell.alias)).toHaveLength(1);

        delete shell.alias["print"];
        expect(Object.keys(shell.alias)).toHaveLength(0);

        shell.env["USER_ID"] = "123456";
        expect(shell.env["USER_ID"]).toBeDefined();

        expect(shell.history).toHaveLength(0);

        const previousSessionHistory = ["clear", "help", "echo 1"];
        shell.history.push(...previousSessionHistory);

        expect(shell.history).toHaveProperty("length", 3);

        shell.history.splice(0);

        expect(shell.history).toHaveProperty("length", 0);
    });

    test("add and remove commands", () => {
        expect(shell).toHaveProperty("addCommand");
        expect(shell).toHaveProperty("removeCommand");

        expect(() => {
            shell.addCommand("hello", {
                synopsis: "hello [user]",
                description: "Displays a greeting message for the user",
                action: (process: IProcess): void | Promise<void> => {
                    process.stdout.write("\nHello " + process.argv[0]);
                }
            });
        }).not.toThrowError();

        expect(() => shell.removeCommand("hello")).not.toThrowError();
    });

    test("builtin commands", () => {
        const builtin = [
            "exit",
            "clear",
            "pwd",
            "echo",
            "alias",
            "unalias",
            "export",
            "history",
            "help"
        ];

        builtin.forEach((name) => {
            expect(() => {
                shell.addCommand(name, {
                    synopsis: name,
                    description: "re-implemented builtin command",
                    action() {
                        return Promise.resolve();
                    }
                });
            }).toThrowError(/command already exists/g);
        });
    });

    test("state management", () => {
        shell.history.push("export");

        expect(shell.history).toHaveLength(1);

        const backup = shell.exportState();

        expect(backup).toBeDefined();

        const shell2 = new ViteShell();
        shell2.loadState(backup);

        expect(shell2.history).toEqual(shell.history);
    });

    test("activating the shell for command execution", () => {
        // exit code
        expect(shell.execute("npm")).rejects.toMatch(/inactive/g);

        // activate shell
        shell.init("Hello World!\n");

        // existing command
        expect(shell.execute("help")).resolves.toEqual(undefined);
    });

    test("executing commands", async () => {
        // mock output
        const box: string[] = [];
        shell.onerror = (data) => box.push(data);
        shell.onoutput = (data) => box.push(data);
        shell.onclear = () => box.splice(0);

        // first initialise
        shell.init();
        expect(shell.env["?"]).toEqual("0");

        // builtin command
        await shell.execute("clear").finally(() => {
            expect(box).toHaveLength(1);
        });
        // exit status
        expect(shell.env["?"]).toEqual("0");

        // unknown command
        await shell.execute("blahblah").finally(() => {
            expect(box).toHaveLength(3);
            expect(box.at(-2)).toMatch(/command not found/g);
        });
        // exit status
        expect(shell.env["?"]).toEqual("1");
    });

    // test("timing commands");

    test("removing commands", async () => {
        // don't remove built-in commands, unless or otherwise needed
        shell.init();

        // test `help` command
        await shell.execute("help");
        expect(shell.env["?"]).toEqual("0");

        // remove `help` command
        expect(() => shell.removeCommand("help")).not.toThrowError();

        // retry `help` command
        await shell.execute("help");
        expect(shell.env["?"]).toEqual("1");
    });
});
