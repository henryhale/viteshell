import InputStream from "../source/streams/input";

describe("Input stream interface", () => {
    let stdin: InputStream;

    beforeEach(() => {
        stdin = new InputStream();
    });

    test("initialization", () => {
        expect(stdin).toBeDefined();

        expect(stdin).toHaveProperty("isBusy");
        expect(stdin).toHaveProperty("insert");
        expect(stdin).toHaveProperty("readline");
        expect(stdin).toHaveProperty("reset");
    });

    test("usage", () => {
        expect(stdin.isBusy).toBeFalsy();

        stdin.insert("echo 1");

        expect(stdin.readline()).resolves.toEqual("echo 1");

        expect(stdin.readline()).resolves.toBe("echo 2");

        expect(stdin.isBusy).toBeTruthy();

        stdin.insert("echo 2");

        expect(stdin.isBusy).toBeFalsy();
    });
});
