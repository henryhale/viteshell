# viteshell | docs

Table of Contents

-   Overview
-   Getting Started
-   Installation
-   Initialization
-   State Management
-   Commands
-   Callback
-   Activation
-   Command Execution
-   Chaining and Pipes
-   Abort Signal
-   API Reference

## Overview

According to the GNU Bash Reference Manual, _a shell is simply a macro processor that executes commands._

`viteshell` is made to be used in interactive mode only, that is, accept input typed from keyboard.
It is intended to work synchronously; waiting for command execution to complete before accepting more input.
Just like real shell programs like dash, bash, fish or zsh, `viteshell` provides a set of built-in commands as well as environment variables. However, it does not contain or implement it's own file system.

Everything you need to know about how `viteshell` works is discussed in the subsquent sections.

## Getting Started

To get started with `viteshell`, you will need an interface through which you can enter commands and also view output of the executed commands. The interface can be the browser console or a remote server or an in-browser terminal emulator(like xterminal or jquery.terminal or xterm.js).

## Installation

The latest version of `viteshell`, packaged and published on npm, can be installed into a new or existing project in a number of ways:

-   NPM : Install the module via [npm](https://npmjs.org/package/viteshell). Run the following command to add as a dependency.

    ```sh
    npm install viteshell
    ```

    Then import the package:

    ```js
    import ViteShell from "viteshell";
    ```

-   CDN: Install the module using any CDN that delivers packages from npm registry, for example: [unpkg](https://unpkg.com/viteshell/), [jsdelivr](https://cdn.jsdelivr.net/npm/viteshell/)

    Using [unpkg](https://unpkg.com/viteshell/):

    ```html
    <script
        type="text/javascript"
        src="https://unpkg.com/viteshell/dist/viteshell.umd.js"
    ></script>
    ```

    Or [jsDelivr](https://cdn.jsdelivr.net/npm/viteshell/):

    ```html
    <script
        type="text/javascript"
        src="https://cdn.jsdelivr.net/npm/viteshell/dist/viteshell.umd.js"
    ></script>
    ```

## Initialization

To use `viteshell`, first create a new instance of it

```html
<script>
    const vsh = new ViteShell();
</script>
```

## Shell Management

`viteshell` maintains it's own state used during command execution. It contains a list of aliases, environment variables and command history.

### Aliases

These are basically placeholders of other commands.
They allow a string to be substituted for a word when it is used as the first word of a [simple command](#simple-commands).
The shell's alias object can be accessed using `vsh.alias`.

**Example:** set `print` as another name of the `echo` command

```js
vsh.alias["print"] = "echo";
```

**Example:** unset `print` alias

```js
delete vsh.alias["print"];
```

Using viteshell's `alias` and `unalias` [built-in commands](#builtin-commands), aliases can be set and unset.

By default, `viteshell` provides a number of aliases that may be commonly known for example: `cls` for `clear`, `print` for `echo` and so on. View all of them in your console using: `console.log(vsh.alias)`;

### Environment Variables

The shell uses variables to store pieces of information for its internal operations such as parameter and variable expansion.
These variables are stored in the `vsh.env` object.

**Example:** changing the default prompt `PS1` to `# `

```js
vsh.env["PS1"] = "# ";
```

**Example:** a compound variable (contains other variables)

```js
vsh.env["PS1"] = "$USERNAME@$HOSTNAME # ";
```

There exists `export` [built-in command](#builtin-commands) for setting and displaying these variables.

### History

Whenever the shell recieves input, it is stored in the history object. `viteshell` does not store similar and consecutive inputs.

To access the entries in the history: `vsh.history`

```js
console.log(vsh.history);
```

### Backup and Restore

You can backup and restore the state of the shell using `vsh.exportState()` and `vsh.loadState()`.

**Example:** backup state

```js
const backup = vsh.exportState(); // JSON string

localStorage.setItem("shell", backup);
```

**Example:** Restore state automatically

```js
window.onload = () => {
    const backup = localStorage.getItem("shell");
    vsh.loadState(backup);
};
```

## Commands

A sequence of words provided as input to the shell denotes a command. For example: `echo 1 2 3 4` denotes a simple command `echo` followed by space separated arguments `1`, `2`, `3` and `4`. When executed, the shell captures it's exit status and saves it in the environment variable: `?`

A combination of several simple commands separated by the shell's special character (delimiters) results into a compound command. In `viteshell`, delimiters include [chaining](#chaining) characters and [pipes](#pipes).

### Builtin Commands

`viteshell` comes with buitlin commands most of which can be re-implemented by you.

<dialog>
<summary>View Builtin Commands</summary>

-   exit

    _exit_ - Terminates the current process

-   clear

    _clear_ - Clears the standard output stream

-   pwd

    _pwd_ - Prints the current working directory

-   echo

    _echo [args]_ - Write arguments to the standard output followed by a new line character.

-   alias

    _alias [-p] [name=[value] ...]_ - Defines aliases for commands

-   unalias

    _unalias [name ...]_ - Removes aliases for commands

-   export

    _export [-p] [name=[value] ... ]_ - Set shell variables by name and value

-   history

    _history [-c] [-n]_ - Retrieve previous input entries

-   help

    _help [command]_ - Displays information on available commands.

-   read

    _read [prompt] [variable]_ - Capture input and save it in the env object

-   sleep

    _sleep [seconds]_ - Delay for a specified amount of time (in seconds).

</dialog>

### Custom Commands

You can add custom commands like `hello`:

```js
vsh.addCommand("hello", {
    desc: "A command that greets the user",
    usage: "hello [...name]",
    action(process) {
        const { argv, stdout } = process;
        if (argv.length) {
            stdout.writeln(
                `Hello ${argv.join(" ")}.\nIt is your time to shine.`
            );
        } else {
            stdout.writeln(`Opps!! I forgot your name.`);
        }
    }
});
```

Simply remove a command using

```js
vsh.removeCommand(/* name */);
```

## Callbacks

You need a terminal interface for inputting textual commands and outputting data.

Below is a generic setup to register callback functions for output handling and shell termination.

```js
vsh.onoutput = (data) => {
    /* print data */
};
vsh.onerror = (error) => {
    /* print error */
};
vsh.onclear = () => {
    /* clear output display */
};
vsh.onexit = () => {
    /* cleanup */
};
```

Output and input streams can be implemented to make use of the in-browser console or a remote server or web-based terminal emulator(like [xterminal](https://github.com/henryhale/xterminal), [xterm.js](https://github.com/xtermjs/xterm.js), jquery.terminal).

In case you want to use a terminal emulator, [XTerminal](https://github.com/henryhale/xterminal) provides a simple interface (recommended). Checkout [vix](https://github.com/henryhale/vix), a starter template for `viteshell` and XTerminal. Learn how to use `xterminal` [here](https://github.com/henryhale/xterminal#readme).

Otherwise, for simplicity, add two elements in your markup: `#input` for capturing input and `#output` for displaying output.

```html
<div id="output"></div>
<input id="input" type="text" />
```

Now connect your shell to utilize those elements as follows:

```js
const vsh = new ViteShell();

const output = document.querySelector("#output");
const input = document.querySelector("#input");

vsh.onoutput = (data) => (output.innerHTML += data);
vsh.onerror = (error) => (output.innerHTML += error);
vsh.onclear = () => (output.innerHTML = "");

input.onkeydown = (ev) => {
    if (ev.key == "Enter") {
        ev.preventDefault();
        vsh.execute(input.value);
        input.value = "";
    }
};
```

> Note: The `vsh.execute()` is discussed in [command execution](#command-execution) section.

## Activation

Now activate the shell to prepare it for command execution with an optional _greeting or intro_ message.

```js
vsh.init("\nHello World!\n");
```

The above line not only activates the shell but also prints the greeting message followed by the default prompt.

At this point, it should be working just well.

## Command Execution

### Executing commands

Since you have connected your shell to an input/output stream using [callbacks](#callbacks) and it is [activated](#activation), you can now execute commands:

-   using the input element: type `help` and hit `Enter` key on your keyboard

-   programmatically

```js
const exec = async (input) => {
    return await vsh.execute(input);
};

exec('echo "Hello World!"');
```

### Timeout

Set an execution time limit beyond which the execution of a command is aborted.

**Example:** All commands must execute to completion in less than `5` seconds otherwise aborted.

```js
vsh.setExecutionTimeout(5);
```

## Chaining and Pipes

### Chaining

Sometimes you need to run commands basing on the success or failure of the previously executed command or just normally.

**Example:**

-   `echo "1" && echo "2"` : If the first command (`echo 1`) is succesfully executed, then `echo 2` will be executed.
-   `echo "1" || echo "2"` : The second command (`echo 2`) will not be executed if the first was succesfull.
-   `echo "1" ; echo "2"` : Both commands are executed irrespective of the success or failure of the previously executed command.

### Pipes

Use `|` to pipe the output of one command as input to another command.

**Example:** To search for occurences of the word (_clear_) in the output of help: `help | grep clear`

## Abort Signal

To abort an executing command, invoke the `abort` method with an optional reason.

**Example:** Abort on recieving `CTRL+C`

```js
document.addEventListener("keydown", (ev) => {
    if (ev.ctrlKey && ev.key.toLowerCase() == "c") {
        ev.preventDefault();

        // abort the execution
        vsh.abort(/* reason */);
    }
});
```

## API Reference

The full public API for `viteshell` is contained within the TypeScript [declaration file](https://github.com/henryhale/viteshell/blob/master/source/interface.ts). It helps you understand the different interfaces required to setup your shell.
