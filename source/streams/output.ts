import type { OutputData, OutputType } from '../interface';

/**
 * Output stream
 */
export default class OutputStream {
    private isActive: boolean;
    public bufferOutput: boolean;
    private readonly buffer: { type: OutputType; data: OutputData }[];

    public onoutput?: (data: OutputData) => void;
    public onerror?: (msg: OutputData) => void;
    public onclear?: () => void;

    constructor() {
        this.isActive = true;
        this.bufferOutput = false;
        this.buffer = [];
    }

    /**
     * Deactivates the stream, no writes allowed
     */
    public disable(): void {
        this.isActive = false;
    }

    /**
     * Activates the stream, writing data is allowed
     */
    public enable(): void {
        this.isActive = true;
    }

    /**
     * Clears the entire output stream
     */
    public clear(): void {
        this.onclear?.call(undefined);
    }

    /**
     * Output data to the stream
     *
     * The data is buffered incase of piping.
     */
    public write(data: OutputData, type: OutputType = 'data'): void {
        if (!this.isActive) {
            return;
        }
        if (this.bufferOutput) {
            this.buffer.push({ type, data: `${data}` });
        } else {
            (type === 'data' ? this.onoutput : this.onerror)?.call(
                undefined,
                `${data}`
            );
        }
    }

    /**
     * Output error messages
     */
    public error(msg: OutputData): void {
        this.write(msg, 'error');
    }

    /**
     * Retrieves the data from the buffer leaving it empty
     */
    public get extract(): string[] {
        return this.buffer.splice(0).map((v) => `${v.data}`);
    }

    /**
     * Empties the stream's buffer by outputting data
     */
    public flush(): void {
        this.bufferOutput = false;
        if (this.buffer.length) {
            const data = this.buffer.splice(0);
            for (const d of data) {
                this.write(d.data, d.type);
            }
        }
    }

    /**
     * Reset the stream's state
     */
    public reset() {
        this.flush();
        this.enable();
    }
}
