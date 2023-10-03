import { defineEnv } from "./env";
import type { IAlias, IEnv, IShellState, IState } from "../interface";

export default class State implements IShellState {
    public readonly env: IEnv;
    public readonly alias: IAlias;
    public readonly history: string[];

    constructor() {
        this.env = defineEnv();
        this.alias = {};
        this.history = [];
    }

    public import(savedState: string): void {
        const parsed = this.spawn(savedState);
        this.patch(parsed);
    }

    public toJSON(): string {
        return JSON.stringify({
            history: this.history,
            alias: this.alias,
            env: this.env
        });
    }

    public spawn(str?: string): IState {
        return JSON.parse(str || this.toJSON());
    }

    public patch(mutatedState: IState): void {
        Object.assign(this.alias, mutatedState.alias);
        Object.assign(this.env, mutatedState.env);
        this.history.splice(0);
        this.history.push(...mutatedState.history);
    }
}
