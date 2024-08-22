import type { IAlias, IEnv } from '../interface';
import { defineEnv } from './env';

/**
 * Storable Shell State
 */
export interface IState {
    readonly env: IEnv;
    readonly alias: IAlias;
    readonly history: string[];
}

/**
 * Create shell's state
 */
export function defineState(): IState {
    return {
        env: defineEnv(),
        alias: {},
        history: []
    };
}

/**
 * Create a copy of the shell's state
 */
export function spawnState(s: IState | string): IState {
    return JSON.parse(typeof s === 'string' ? s : JSON.stringify(s));
}

/**
 * Patch changes into original state
 */
export function patchState(original: IState, mutated: IState): void {
    Object.assign(original.alias, mutated.alias);
    Object.assign(original.env, mutated.env);
    original.history.splice(0);
    original.history.push(...mutated.history);
}
