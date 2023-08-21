import OutputStream from "../source/output/index";

describe("Output stream", () => {
    let stdout: OutputStream;

    beforeEach(() => {
        stdout = new OutputStream();
    });

    test("initialization", () => {
        expect(stdout).toBeDefined();

        expect(stdout).toHaveProperty("write");
        expect(stdout).toHaveProperty("error");
        expect(stdout).toHaveProperty("clear");
        expect(stdout).toHaveProperty("reset");
        expect(stdout).toHaveProperty("extract");

        expect(stdout.bufferOutput).toBeFalsy();
        expect(stdout.onclear).toBeUndefined();
        expect(stdout.onerror).toBeUndefined();
        expect(stdout.onoutput).toBeUndefined();
    });

    test("usage", () => {
        // terminal output
        const box: (string | number)[] = [];

        stdout.onoutput = (data) => box.push(data);
        stdout.onerror = (msg) => box.push(msg);
        stdout.onclear = () => box.splice(0);

        expect(stdout.write("hello world 1")).toBeUndefined();
        expect(box.length).toEqual(1);

        expect(stdout.extract).toEqual([]);

        stdout.bufferOutput = true;

        stdout.write("hello dev!");
        expect(box.length).toEqual(1);

        expect(stdout.extract).toEqual(["hello dev!"]);

        stdout.write("hello world 2");

        // reset flushs the output buffer
        stdout.reset();
        expect(box.length).toEqual(2);

        expect(stdout.extract).toEqual([]);
    });
});
