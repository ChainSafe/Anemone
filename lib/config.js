"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

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
  numTransactions: "1000",
  //number of wallets that will be created to throw/recieve transactions
  numWallets: "20",
  //set true to deploy and test the smart contracts containing each opcode
  testOpCodes: true,
  //value (in wei) to send in each transation
  amount: "10",
  //gas price in gwei for each transaction generated
  gasPrice: "40",
  //max gas to set for each transaction generated
  maxGas: "210000",
  //private key of wallet that will fund the other sender wallets
  funderPrivateKey: "",
  //chainId, currently 1337 for kensignton testnet
  chainId: 1337
};
var _default = config;
exports.default = _default;
//# sourceMappingURL=config.js.map