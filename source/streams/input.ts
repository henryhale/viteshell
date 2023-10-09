import { isFunction } from "../helpers";
import type { StandardInput } from "../interface";

/**
 * Input stream
 */
export default class InputStream implements StandardInput {
    private readonly buffer: string[];
    private extractor?: () => void;

    constructor() {
        this.buffer = [];
        this.extractor = undefined;
    }

    public get isBusy(): boolean {
        return this.extractor !== undefined;
    }

    public insert(data = ""): void {
        this.buffer.push(data);
        if (isFunction(this.extractor)) {
            this.extractor.call(undefined);
        }
    }

    private get extract(): string {
        return this.buffer.shift()?.trim() || "";
    }

    public readline(): Promise<string> {
        return new Promise<string>((resolve) => {
            if (this.buffer.length) {
                resolve(this.extract);
            } else {
                this.extractor = () => {
                    this.extractor = undefined;
                    resolve(this.extract);
                };
            }
        });
    }

    public clear(): void {
        this.buffer.splice(0);
    }
}
