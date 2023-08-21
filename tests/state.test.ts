import { IEnv } from "../source/interface";
import { defineEnv, replaceEnvVariables } from "../source/state/env";
import ShellState from "../source/state/index";

describe("Environmental variables", () => {
    let env: IEnv;

    beforeEach(() => {
        env = defineEnv();
    });

    test("defining a new env object", () => {
        expect(env).toBeDefined();
        expect(env["SHELL"]).toStrictEqual("vsh");
    });

    test("variable management", () => {
        expect(env["TEST"]).toBeUndefined();
        env["TEST"] = 123;
        expect(env["TEST"]).toBeDefined();
        env["TEST"] = 456;
        expect(env["TEST"]).toEqual(456);
        delete env["TEST"];
        expect(env["TEST"]).toBeUndefined();
    });

    test("variable substitution", () => {
        expect(replaceEnvVariables(env, "$SHELL")).toBe("vsh");
        expect(replaceEnvVariables(env, "Exit code: $?")).toBe("Exit code: 0");
        expect(replaceEnvVariables(env, "User: $USERNAME")).toBe("User: user");
        expect(replaceEnvVariables(env, "[$USERNAME@$HOSTNAME] # ")).toBe(
            "[user@web] # "
        );
        expect(replaceEnvVariables(env, env["PS1"] + "")).toBe(
            "\nuser@web: / $ "
        );
    });
});

describe("Shell state", () => {
    let state: ShellState;

    beforeEach(() => {
        state = new ShellState();
    });

    test("initialization", () => {
        expect(state).toBeDefined();

        expect(state).toHaveProperty("env");
        expect(state).toHaveProperty("alias");
        expect(state).toHaveProperty("history", []);

        expect(state.env).toBeDefined();
        expect(state.alias).toBeDefined();
    });

    test("state management", () => {
        state.history.push("help");
        state.env["SESSION_ID"] = 123456;
        state.alias["info"] = "help";

        expect(state.history).toHaveLength(1);
        expect(Object.keys(state.alias)).toHaveLength(1);

        expect(state.toJSON()).toBeDefined();

        expect(state.spawn()).toEqual(state);

        const spawnedState = state.spawn();

        spawnedState.alias["man"] = "help";
        spawnedState.history.push("clear");

        expect(spawnedState).not.toEqual(state);

        state.patch(spawnedState);

        expect(state).toEqual(spawnedState);
        expect(state.alias.size).toEqual(spawnedState.alias.size);
        expect(state.history).toHaveLength(spawnedState.history.length);
    });
});
