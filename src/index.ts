#!/usr/bin/env node

const {Command} = require('commander');
const program = new Command();
program.description("Anemone is an Ethereum node compatibility testing tool.")

// Comands
import * as commands from "./cmds"; 

program.exitOverride();
program.allowUnknownOption(false);

for (let cmd in commands) {
    program.addCommand(commands[cmd])
}

if (process.argv && process.argv.length <= 2) {
    program.help();
} else {
    try {
        program.parse(process.argv);
    } catch (e) {
        program.help();
        process.exit(1)
    }
}

