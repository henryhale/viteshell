import { isFunction } from '../helpers';
import type { StandardInput } from '../interface';

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

    /**
     * Checks whether there is an executing command waiting for
     * user input
     */
    public get isBusy(): boolean {
        return this.extractor !== undefined;
    }

    /**
     * Saves input data into a queue (buffer)
     */
    public insert(data = ''): void {
        this.buffer.push(data);
        if (isFunction(this.extractor)) {
            this.extractor.call(undefined);
        }
    }

    /**
     * Retrieves the data at the front of the queue (buffer)
     */
    private get extract(): string {
        return this.buffer.shift()?.trim() || '';
    }

    /**
     * Extracts an input string from the input buffer
     *
     * It uses a callback function if the buffer is empty.
     */
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

    /**
     * Reset the stream's state
     */
    public reset(): void {
        this.buffer.splice(0);
        this.extractor = undefined;
    }
}
