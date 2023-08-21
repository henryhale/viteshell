<div align="center">
<h1>viteshell</h1>
<p>A minimalistic shell implementation written in TypeScript.</p>
<img alt="GitHub Workflow Status" src="https://img.shields.io/github/actions/workflow/status/henryhale/viteshell/npm-publish.yml">
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
- _Plugins: WIP_
  
### Functionality
- **Command Chaining & Pipes**: Piping & Chaininig commands using `;`, `|`, `&&` and `||`
- **Builtin Commands**: Contains commands such as _exit, clear, pwd, echo, alias, unalias, export, history & help_.
- **NodeJS-like Process object**: Contains _env, argv, stdout, and more_.
- **Alias**: Manage command aliases
- **Environment Variables**: Manage command aliases
- **Backup & Restore**: Save or restore the shell state
- **Abort signal**: Execution of a command can be aborted
- **Execution Timeout**: _(experimental)_ Command execution time limit

> **Note**: Currently, `viteshell` only provides a platform for handling some basic shell operations. Support for other functionalities like input/output redirection, shell scripts, complex shell expansion and job control is not provided.  


## Installation

Install the module via [npm](https://npmjs.org/package/viteshell). Run the following command to add as a dependency.

```sh
npm install viteshell
```

Then import the package:

```js
import ViteShell from 'viteshell';
```

### Alternative Installation

You can install `viteshell` using any CDN that delivers packages from npm registry, for example: [unpkg](https://unpkg.com/viteshell/), [jsdelivr](https://cdn.jsdelivr.net/npm/viteshell/)

Using [unpkg](https://unpkg.com/viteshell/):

```html
<script type="text/javascript" src="https://unpkg.com/viteshell/dist/viteshell.umd.js"></script>
```

Using [jsDelivr](https://cdn.jsdelivr.net/npm/viteshell/):

```html
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/viteshell/dist/viteshell.umd.js"></script>
```

## API

The full public API for `viteshell` is contained within the TypeScript [declaration file](https://github.com/henryhale/viteshell/blob/master/source/interface.ts). It helps you understand the different interfaces required to setup your shell.

## Usage

To use `viteshell`, first create a new instance

```js
const vsh = new ViteShell();
```

Check out the documentation below: 
<details>

### Input/Output Channels

You might need a terminal interface for inputting and outputting textual commands. 

>[XTerminal](https://github.com/henryhale/xterminal) provides that interface, learn how to use `xterminal` [here](https://github.com/henryhale/xterminal#readme).

Below is a basic setup to connect the shell to that kind of channel.

```js
vsh.onoutput = (data) => { /* print data */ };
vsh.onerror = (error) => { /* print error */ };
vsh.onclear = () => { /* clear output display */ };
```

### Activating the shell

Now initialize the shell to prepare it for command execution (activate the shell) with an optional _greeting message_.

```js
vsh.init("\nHello World!\n");
```

### Custom commands

You can add custom commands like `hello`:

```js
vsh.addCommand('hello', {
    desc: 'A command that greets the user',
    usage: 'hello [...name]',
    action(process) {
        const { argv, stdout } = process;
        if (argv.length) {
            stdout.write(`Hello ${argv.join(' ')}.\nIt is your time to shine.\n`);
        } else {
            stdout.write(`Opps!! I forgot your name.`);
        }
    }
});
```

Simply remove a command using

```js
vsh.removeCommand(/* name */);
```

### Executing commands

You can programmatically execute the commands;

```js
(async () => {
    //...

    await shell.execute('help');

    //...
});
```

### Command Chaining & Pipes

Sometimes we need to run commands basing on the success or failure of the previously executed command or just normally.
For example;

- `echo "1" && echo "2"` : If the first command (`echo 1`) is succesfully, then `echo 2` will be executed.
- `echo "1" || echo "2"` : The second command (`echo 2`) will not be executed if the first was succesfull.
- `echo "1" ; echo "2"` : Both commands are executed irrespective of the success of the previously executed command.

Use `|` to pipe the output of one command as input to another command.

### Aborting commands

To abort an executing command, invoke the `abort` method with an optional reason for example:

```js
document.addEventListener("keydown", (ev) => {
    if (ev.ctrlKey && ev.key.toLowerCase()) {
        ev.preventDefault();

        // abort the execution
        vsh.abort(/* reason */);

    }
});
```

### State Management

Backup your shell state using `vsh.exportStete()` and restore using `vsh.loadState(backup)`.

```js
const backup = vsh.exportState(); // JSON string

// later...

vsh.loadState(backup);
```

</details>

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

### Building the Library

To build the library, run `pnpm build`

This will generate the production-ready distribution files in the `dist` directory.

## License

Copyright (c) 2023 [Henry Hale](https://github.com/henryhale).

Released under the [MIT License](https://github.com/henryhale/viteshell/blob/master/LICENSE.txt).
>>>>>>> ecbd1d6 (initial commit)
