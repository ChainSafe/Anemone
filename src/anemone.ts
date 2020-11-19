import {ethers, Wallet} from "ethers";
import {JsonRpcProvider} from "ethers/providers";

import config from "./config";
import {bn, parseGwei} from "./utilities/conversion";

const connect = (url: string): JsonRpcProvider => {
  return new ethers.providers.JsonRpcProvider(url, "");
};

/*
* Generates num wallets
*/
const generateWallets = async (num: number) => {
  const wallets = [];
  for (let i = 0; i < num; i++) {
    const wallet: Wallet = ethers.Wallet.createRandom();
    wallets.push(wallet);
    const address = await wallet.getAddress();
    console.log(`Created wallet with address ${address}`);
    
  }
  console.log('\n');
  return wallets;
};


/*
* Funds wallets in array wallets with mainWallet
*/
const fundWallets = async (wallets: any[], mainWallet: any): Promise<string[]> => {
  //send each wa]llet the max possible gas amount for each transaction + the amount of the transaction as specified in config
  const numTransactions = bn(Math.ceil(config.numTransactions/config.numWallets));
  const transactionAmount = bn(config.amount).mul(numTransactions);
  const maxGasAmount = (bn(ethers.utils.parseUnits(config.gasPrice, "gwei")).mul(bn(config.maxGas))).mul(numTransactions);
  const amount = transactionAmount.add(maxGasAmount);

  const txHashes: string[] = [];
  const numWallets = wallets.length;
  let nonce = await mainWallet.getTransactionCount();
  for (let i = 0; i < numWallets; i++) {
    const dest = await wallets[i].getAddress();
    const tx = {
      nonce: nonce,
      value: amount,
      to: dest,
      gasLimit: bn(config.maxGas),
      gasPrice: parseGwei(config.gasPrice),
      chainId: config.chainId
    };
    const txResponse = await mainWallet.sendTransaction(tx);
    console.log(`sent transaction to fund address ${dest} at provider ${mainWallet.provider.connection.url}`);
    txHashes.push(txResponse.hash);
    nonce += 1;
  }
  console.log(`\n`);

  return txHashes;

};

/*
* Creates and broadcasts batches of transactions from wallets in array wallets to provider
*/
const batchTxs = async (wallets: any[], provider: JsonRpcProvider) => {
  //we want to split the transactions equally among the wallets to be sent from.
  const numTransactions = bn(Math.ceil(config.numTransactions/config.numWallets));
  const amount = bn(config.amount);
  const txs: any = [];
  const numWallets = wallets.length; 
  console.log("Broadcasting transactions..."); 
  for (let i = 0; i < wallets.length; i++) {
    const sender: Wallet = new ethers.Wallet(wallets[i].privateKey, provider);

    let nonce = 0;
    for (let j = 0; j < numTransactions; j++) {
      //"randomly" select wallet among created wallets to receive transaction
      const destIndex = Math.floor(Math.random() * (numWallets));
      const dest = await wallets[destIndex].getAddress();
      const tx = {
	      nonce: nonce,
        value: amount,
        to: dest,
        gasLimit: bn(config.maxGas),
        gasPrice: parseGwei(config.gasPrice),
        chainId: config.chainId,
      };
      nonce += 1;
      sender.sendTransaction(tx);
      txs.push(tx); 
    }
  }
  console.log(`\nCreated and broadcasted ${txs.length} transactions at provider ${provider.connection.url}`);
  return txs;
};

/*
* Broadcasts transactions from mainWallet to provider to call testOpcodes() at all known deployed contract addresses
*/
const testOpcodes = async (provider: JsonRpcProvider, contractAddresses: any[], mainWallet) => {

  let nonce = await mainWallet.getTransactionCount();
  let txResponses = [];
  console.log(`calling testOpcodes at provider at provider ${provider.connection.url}...`);
	
  for (let i = 0; i < contractAddresses.length; i++){
    const tx = {
      nonce: nonce,
      to: contractAddresses[i],
      value: 0,
      gasLimit: bn(config.maxGas),
      gasPrice: parseGwei(config.gasPrice),
      chainId: config.chainId,
      //ABI for all contracts is the same, testOpcodes is 0x391521f4
      data: "0x391521f4"
    };
    const txResponse = await mainWallet.sendTransaction(tx);
    txResponses.push(txResponse.hash);
    nonce += 1;
  }

  return txResponses;
};

/*
* Broadcasts transactions with known edgecase data from mainWallet to provider
*/
const testEdgecases = async (provider: JsonRpcProvider, txData: any[], mainWallet) => {
  let nonce = await mainWallet.getTransactionCount();
  let txResponses = [];
  console.log(`testing edgecases at ${provider.connection.url}...`)
  for (let i = 0; i < txData.length; i++){
    console.log(txData[i]);
    const tx = {
      nonce: nonce,
      gasLimit: bn(config.maxGas),
      gasPrice: parseGwei(config.gasPrice),
      chainId: config.chainId,
      data: txData[i]
    };
    const txResponse = await mainWallet.sendTransaction(tx);
    txResponses.push(txResponse.hash);
    nonce += 1;
  }
  return txResponses;
}

export {
  connect,
  generateWallets,
  fundWallets,
  batchTxs,
  testOpcodes,
  testEdgecases
};