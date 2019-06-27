const ethers = require("ethers");

// Relative Imports
import config from "../config";
import {connect, generateWallets, fundWallets, batchTxs} from "./attalus";
import {TransactionsMined} from "./utilities/isTransactionMined";
import {JsonRpcProvider} from 'ethers/providers';

const Main = async () => {
  // Provider
  const provider: JsonRpcProvider = connect(config.rpcUrl);

  // Constants
  const numWallets: number = config.numWallets;

  // Setup wallets
  const mainWallet = new ethers.Wallet(config.funderPrivateKey, provider);
  const wallets = await generateWallets(numWallets);

  // Send fuel to subwallets
  const txHashes: Array<string> = await fundWallets(wallets, mainWallet);

  await TransactionsMined(txHashes, 500, provider);

  //create and send the transactions
  await batchTxs(wallets, provider);
  

};

export default Main;