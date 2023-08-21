import { isCommandValid } from "../source/commands/index";

describe("Commands", () => {
    test("check if command configuration is valid", () => {
        const commandConfig = {
            synopsis: "echo [...args]",
            description: "Prints the argument to the output stream",
            action() {
                console.log("mock printing...");
            }
        };
        expect(isCommandValid(commandConfig)).toBeTruthy();
    });
});
