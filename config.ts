/**
 * Configure default values for the script here plsssss
 * 
 * make sure an RPC port is exposed for the node you want
 * to broadcast transactions too as well!
 * 
 * @TODO add "continuous" mode, to send a batch of n transactions
 * every minute for x minutes
 * 
 */

const config: any = {

    //Url to node open for RPC, defaults to default localhost port
    rpcUrl: "http://localhost:8545",
    
    //rpcUrl: "https://wbm-stephanie.boxes.whiteblock.io:5001/rpc",

    //number of transactions to generate and throw
    numTransactions: "1000",

    //number of wallets that will be created to throw/recieve transactions
    numWallets: "20",

    //set true to deploy and test the smart contracts containing each opcode
    testOpCodes: true,

    //value (in wei) to send in each transation
    amount: "0",    

    //gas price in gwei for each transaction generated
    gasPrice: "40",

    //max gas to set for each transaction generated
    maxGas: "210000",

    //private key of wallet that will fund the other sender wallets
    funderPrivateKey: "f012dbcd3fb3c0d1e76d55bf4a5360f0eff0923e5600dd75be0441453767e2f2",

    //funderPrivateKey: "ab9fbe07ae0857367c954880ab454bd37074a381f642465f62bbee5e242edc8a",

    //chainId
    chainId: 1337,

};

export default config;
