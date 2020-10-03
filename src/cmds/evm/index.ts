import {Command} from "commander";
import {EVM} from "./evm";

const evmCommand = new Command("evm");
evmCommand.description("Tests related to the Ethereum Virtual Machine (EVM)");

interface IEvmArgs {
    url?: string;
    privateKey?: string;
    wallets?: number;
    chainId?: number;
    opcodes?: boolean;
    edgeCases?: boolean;
}

const run = new Command("run")
    .description("Runs evm compatibility check")
    .option('--url <url>', 'URL to the json-rpc server', "http://localhost:8545")
    .option('--pk, privateKey <value>', 'Private key to populate wallets', "0xb1157e88556d967936019ff60145276bd6618b9e2a67e505b79a1b50b47fd0f5")
    .option('--wallets <amount>', 'Number of wallets to create', (_, x) => {return x}, 5)
    .option('--opcodes', 'Runs opcode specific tests', false)
    .option('--chainId', "Sets the chain id", (_, x) => {return x})
    .option('--edgeCases', 'Runs evm specific edgecases', false)
    .action(async (args: IEvmArgs) => {
        EVM(args)
        .then(() => { console.log("Anemone executed without errors!");})
        .catch((err: any) => { console.log("Anemone executed with errors: ", err);});
    })

evmCommand.exitOverride();
evmCommand.addCommand(run)

export { 
    evmCommand,
    IEvmArgs,
};