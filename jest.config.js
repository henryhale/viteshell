export default {
    roots: [
        "<rootDir>/tests",
    ],
    testMatch: [
        "**/?(*.)+(spec|test).+(ts)"
    ],
    transform: {
        "^.+\\.(ts)$": ["ts-jest", { tsconfig: "tsconfig.json" }]
    },
    collectCoverageFrom: [
        "**/*.{js,ts}",
        "!**/*.d.ts",
        "!**/node_modules/**",
    ],
    globals: {},
}