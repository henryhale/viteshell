import { ViteShell } from "./shared";

describe('ViteShell', () => {
    test('shell version is defined', () => {
        expect(ViteShell.version).toBeDefined();
    });
});