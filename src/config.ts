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

const config = {

  //Url to node open for RPC, defaults to default localhost port
  rpcUrl: "http://localhost:8545",

  //number of transactions to generate and throw
  numTransactions: "5",

  //number of wallets that will be created to throw/recieve transactions
  numWallets: "5",

  //set true to deploy and test the smart contracts containing each opcode
  testOpCodes: true,

  //set true to deploy and test the smart contracts containing edgecases we have run into
  testEdgecases: true,

  //value (in wei) to send in each transation
  amount: "10",    

  //gas price in gwei for each transaction generated
  gasPrice: "40",

  //max gas to set for each transaction generated
  maxGas: "210000",

  //chainId, currently 1337 for kensignton testnet
  chainId: 1337,

  //pk of a funded account
   pk: '0x0000000000000000000000000000000000000000000000000000000000123456',
};

export default config;
