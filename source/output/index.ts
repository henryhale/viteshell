import type {
    OutputData,
    OutputStreamInterface,
    OutputType
} from "../interface";

export default class OutputStream implements OutputStreamInterface {
    private isActive: boolean;
    public bufferOutput: boolean;
    private readonly buffer: { type: OutputType; data: OutputData }[];

    public onoutput?: (data: OutputData) => void;
    public onerror?: (msg: OutputData) => void;
    public onclear?: () => void;

    public beforeOutput?: (data: string) => string;

    constructor() {
        this.isActive = true;
        this.bufferOutput = false;
        this.buffer = [];
        this.beforeOutput = undefined;
    }

    public disable(): void {
        this.isActive = false;
    }

    public enable(): void {
        this.isActive = true;
    }

    public clear(): void {
        this.onclear?.call(undefined);
    }

    public write(data: OutputData, type: OutputType = "data"): void {
        if (!this.isActive) {
            return;
        }
        data = data?.toString();
        if (this.beforeOutput) {
            data = this.beforeOutput(data);
        }
        if (this.bufferOutput) {
            this.buffer.push({ type, data });
        } else {
            (type == "data" ? this.onoutput : this.onerror)?.call(
                undefined,
                data
            );
        }
    }

    public error(msg: OutputData): void {
        this.write(msg, "error");
    }

    public get extract(): string[] {
        return this.buffer.splice(0).map((v) => v.data + "");
    }

    public flush(): void {
        this.bufferOutput = false;
        if (this.buffer.length) {
            this.buffer.splice(0).forEach((d) => {
                if (d.type === "error") {
                    this.error(d.data);
                } else {
                    this.write(d.data);
                }
            });
        }
    }

    public reset() {
        this.enable();
        this.flush();
    }
}
