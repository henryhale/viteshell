<div align="center">
<h1>viteshell</h1>
<p>A minimalistic shell implementation written in TypeScript.</p>
<img alt="GitHub Workflow Status" src="https://img.shields.io/github/actions/workflow/status/henryhale/viteshell/release.yml">
<img alt="npm" src="https://img.shields.io/npm/v/viteshell">
<img alt="GitHub release (latest SemVer)" src="https://img.shields.io/github/v/release/henryhale/viteshell">
<img alt="npm bundle size" src="https://img.shields.io/bundlephobia/minzip/viteshell">
<img alt="GitHub" src="https://img.shields.io/github/license/henryhale/viteshell">
</div>

## What is `viteshell`?

`viteshell` comes from [vite](https://en.wiktionary.org/wiki/vite), a French word for "quick" and [shell](https://en.wikipedia.org/wiki/Unix_shell), a program that executes other programs in response to text commands.

`viteshell` is lightweight shell implementation written in TypeScript that tends to work just like [bash](https://www.gnu.org/software/bash/). It is intended for use with [xterminal](https://github.com/henryhale/xterminal) but can as well be used elsewhere.

## Key Features

- **Perfomant**: It is lightweight and really fast.
- **Efficient Execution**: Commands are executed asynchronously (with promises).
- **TypeScript Support**: Type declaration files are provided for smooth development.
- **Shell Expansion**: Variable and alias substitution
- **Command Chaining & Pipes**: Piping & Chaininig commands using `;`, `|`, `&&` and `||`
- **Builtin Commands**: Contains commands such as _exit, clear, pwd, echo, alias, unalias, export, history & help_.
- **NodeJS-like Process object**: Contains _env, argv, stdout, and more_.
- **Alias**: Manage command aliases
- **Environment Variables**: Manage command aliases
- **Backup & Restore**: Save or restore the shell state
- **Abort signal**: Execution of a command can be aborted
- **Execution Timeout**: Command execution time limit

> **Note**: Currently, `viteshell` only provides a platform for handling some basic shell operations. Support for other functionalities like input/output redirection, shell scripts, complex shell expansion and job control is not provided.  

## Documentation
To get started with `viteshell`, read the [documentation here](https://github.com/henryhale/viteshell/blob/master/docs/index.md)

## Browser Support

Promises and some other latest ECMAScript features are used in the source code.
Supporting a wide range of browsers is the goal. Modern browsers, most specifically the latest versions of Chrome, Firefox, Safari, and Edge (for desktop and mobile devices) are supported.

## Development

To get started with development, follow these steps:

### Prerequisites

- [Node.js](https://nodejs.org) (>=14)
- [pnpm](https://pnpm.io/) (>=7)

### Setup

1. Clone this repository: `git clone https://github.com/henryhale/viteshell.git`
2. Navigate to the project directory: `cd viteshell`
3. Install dependencies: `pnpm install`
4. Development: `pnpm dev`
5. Run tests using: `pnpm test`

### Building the Library

To build the library, run `pnpm build`

This will generate the production-ready distribution files in the `dist` directory.

## License

Copyright (c) 2023 [Henry Hale](https://github.com/henryhale).

Released under the [MIT License](https://github.com/henryhale/viteshell/blob/master/LICENSE.txt).