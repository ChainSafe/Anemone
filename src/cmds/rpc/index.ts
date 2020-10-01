import {Command} from "commander";
import {ethers} from "ethers";
import transport from "web3-providers-http/src/";
import jsonrpc from "web3-core-requestmanager/src/jsonrpc";
import fs from "fs";
import {Runner, executeTransfer} from "./rpc";
import defaultJsonConfig from "./configs/endpoints.json";

const rpcCommand = new Command("rpc");
rpcCommand.description("Tests related to the Ethereum JSON-RPC");

interface IConfigSchema {
    state: {
        keys: {
            address: string,
            balance: string,
            pkey: string
        }[]
    },
    tests: {
        method: string,
        params: any[],
        expected: "",
        required: boolean,
        stateChange?: any
    }[],
}

const exists = new Command("exists")
    .description("Check if the given endpoint ")
    .option('--url <value>', 'URL to connect to', "http://localhost:8545")
    .option('--pk, privateKey <value>', 'Private key to populate wallets', "0xb1157e88556d967936019ff60145276bd6618b9e2a67e505b79a1b50b47fd0f5")
    .option('--debug', "Run with debug mode", false)
    .option('--config <path>', "Path to config file")
    .action(async function (args) {
        // TODO Move this
        const provider = new ethers.providers.JsonRpcProvider(args.url);
        let mainWallet = new ethers.Wallet(args.privateKey, provider);
    
        let json: IConfigSchema;
        if (args.config) {
            json = JSON.parse(fs.readFileSync(args.config)) as IConfigSchema;
        } else {
            json = defaultJsonConfig as IConfigSchema;
        }
    
        const r = new Runner({
            onlyEndpoints: true,
            debug: args.debug,
        })
        const t = new transport();
    
        // fund and generate new wallets
        const stateKeys = json.state.keys;
        const testWallets = {};
    
        for (let i = 0; i < stateKeys.length; i++) {
            // fund the account
            await mainWallet.sendTransaction({
                to: stateKeys[i].address,
                value: ethers.utils.parseEther(stateKeys[i].balance)
            })
    
            // Create the new wallet
            testWallets[stateKeys[i].address] = new ethers.Wallet("0x" + stateKeys[i].pkey, provider);
        }
    
        const testCases = json.tests;
        for (let i = 0; i < json.tests.length; i++) {
            const test = testCases[i];
            if (test.stateChange && test.stateChange.length > 0) {
                for (let j = 0; j < test.stateChange.length; j++) {
                    if (test.stateChange[j].type === "transfer") {
                        console.log("executed state change")
                        await executeTransfer(testWallets, test.stateChange[j]);
                    }
                }
            }
            const payload = jsonrpc.toPayload(test.method, test.params);
            t.send(payload, r.jsonHandler(r.execute, payload, test.expected, test.required));
        }
        setTimeout(() => {
            r.log();
            if (r.failed) {
                console.log("One or more failures were reported!")
                process.exit(1)
            }
        }, 5000);
    })

exists.exitOverride();
rpcCommand.addCommand(exists)

export { rpcCommand };