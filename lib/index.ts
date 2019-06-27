import {Wallet} from "ethers";

const ethers = require("ethers");

// Relative Imports
import config from "../config";
import {connect, generateWallets, fundWallets, batchTxs} from "./attalus";
import {TransactionsMined} from "./utilities/isTransactionMined";

const Main = async () => {
  // Provider
  const provider = connect(config.rpcUrl);

  // Constants
  const numWallets: number = config.numWallets;

  // Setup wallets
  const mainWallet = new ethers.Wallet(config.funderPrivateKey, provider);
  const wallets = await generateWallets(numWallets, provider);

  // Send fuel to subwallets
  const txHashes = await fundWallets(wallets, mainWallet, provider);

  //await TransactionsMined(txHashes, 500, provider);

  //create and send the transactions
  setTimeout(async function () {
  await batchTxs(wallets, mainWallet, provider);
 }, 180000);


  

};

export default Main;