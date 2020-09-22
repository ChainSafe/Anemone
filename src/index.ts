#!/usr/bin/env node

const {Command} = require('commander');
const program = new Command();

// Comands
import * as commands from "./cmds"; 

program.allowUnknownOption(false);

for (let cmd in commands) {
    program.addCommand(commands[cmd])
}

(async () => {
    if (process.argv && process.argv.length <= 2) {
        program.help();
    } else {
        try {
            await program.parseAsync(process.argv);
        } catch (e) {
            console.log({ e });
            process.exit(1)
        }
    }
})()

