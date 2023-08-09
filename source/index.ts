import { IShell } from "./interface";

export default class ViteShell implements IShell {
    static get version(): string {
        return "__VERSION__";
    }
}
