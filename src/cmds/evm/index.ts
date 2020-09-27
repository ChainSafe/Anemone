import {Command} from "commander";
import {EVM} from "./evm";

const evmCommand = new Command("evm");

const run = new Command("run")
    .description("Runs evm compatibility check")
    .option('--url <value>', 'URL to connect to', "http://localhost:8545")
    .option('-pk, --privateKey <value>', 'Private key with eth')
    .action(async (args) => {
        EVM(args)
        .then(() => { console.log("Anemone executed without errors!");})
        .catch((err: any) => { console.log("Anemone executed with errors: ", err);});
    })

evmCommand.addCommand(run)

export { evmCommand };