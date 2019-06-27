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
    
    //number of transact    ions to generate and throw
    numTransactions: "200",

    //number of wallets that will be created to throw/recieve transactions
    numWallets: "10",

    //set true to deploy and test the smart contracts containing each opcode
    //consider 
    testOpCodes: false,

    //value (in wei) to send in each transation
    amount: "1000",

    //gas price in gwei for each transaction generated
    gasPrice: "40",

    //max gas to set for each transaction generated
    maxGas: "2000000",

    //private key of wallet that will fund the other sender wallets
    funderPrivateKey: "",

};

export default config;
