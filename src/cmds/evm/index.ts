import {Command} from "commander";
import {EVM} from "./evm";

const evmCommand = new Command("evm");

const exists = new Command("exists")
    .description("Check if the given endpoint ")
    .option('--url <value>', 'URL to connect to', "http://localhost:8545")
    .action(async (args) => {
        EVM()
        .then(() => { console.log("Anemone executed without errors!");})
        .catch((err: any) => { console.log("Anemone executed with errors: ", err);});
    })

evmCommand.addCommand(exists)

export { evmCommand };