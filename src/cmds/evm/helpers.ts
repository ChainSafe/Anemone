import {ethers, Wallet} from "ethers";
import {JsonRpcProvider} from "ethers/providers";

import {bn, parseGwei} from "../../utilities/conversion";

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
const fundWallets = async (args: any, wallets: ethers.Wallet[], mainWallet: ethers.Wallet): Promise<string[]> => {
  // send each wallet the max possible gas amount for each transaction
  const numTransactions = bn(Math.ceil(args.numTransactions/args.numWallets));
  const transactionAmount = bn(args.amount).mul(numTransactions);

  // Calculate optimal gas
  const maxGasAmount = (bn(ethers.utils.parseUnits(String(args.gasPrice), "gwei")).mul(bn(args.maxGas))).mul(numTransactions);
  const amount = transactionAmount.add(maxGasAmount);

  const txHashes: string[] = [];
  const numWallets = wallets.length;
  let nonce = await mainWallet.getTransactionCount();
  for (let i = 0; i < numWallets; i++) {
    const dest = await wallets[i].getAddress();
    const tx = {
      nonce: nonce,
      value: args.amount,
      to: dest,
      gasLimit: bn(args.maxGas),
      gasPrice: parseGwei(args.gasPrice),
      chainId: args.chainId
    };
    const txResponse = await mainWallet.sendTransaction(tx);
    console.log(`Sent transaction to fund address ${dest}`);
    txHashes.push(txResponse.hash);
    nonce += 1;
  }
  console.log(`\n`);

  return txHashes;

};

/*
* Creates and broadcasts batches of transactions from wallets in array wallets to provider
*/
const batchTxs = async (args: any, wallets: any[], provider: JsonRpcProvider) => {
  //we want to split the transactions equally among the wallets to be sent from.
  const numTransactions = bn(Math.ceil(args.numTransactions/args.numWallets));

  // To account for gas we reduce the amount being sent by 1 eth
  // const amount = args.amount
  const txs: any = [];
  const numWallets = wallets.length; 
  console.log("Broadcasting transactions..."); 
  for (let i = 0; i < wallets.length; i++) {
    const sender: Wallet = new ethers.Wallet(wallets[i].privateKey, provider);

    let nonce = 0;
    for (let j = 0; j < numTransactions.toNumber(); j++) {
      //"randomly" select wallet among created wallets to receive transaction
      const destIndex = Math.floor(Math.random() * (numWallets));
      const dest = await wallets[destIndex].getAddress();
      const tx = {
	      nonce: nonce,
        value: args.amount,
        to: dest,
        // gasLimit: bn(args.maxGas),
        // gasPrice: parseGwei(args.gasPrice),
        chainId: args.chainId,
      };
      nonce += 1;

      await sender.sendTransaction(tx);
      txs.push(tx); 
    }
  }
  console.log(`\nCreated and broadcasted ${txs.length} transactions at provider ${provider.connection.url}`);
  return txs;
};

/*
* Broadcasts transactions from mainWallet to provider to call testOpcodes() at all known deployed contract addresses
*/
const testOpcodes = async (args: any, provider: JsonRpcProvider, contractAddresses: any[], mainWallet) => {

  let nonce = await mainWallet.getTransactionCount();
  let txResponses = [];
  console.log(`calling testOpcodes at provider at provider ${provider.connection.url}...`);
	
  for (let i = 0; i < contractAddresses.length; i++){
    const tx = {
      nonce: nonce,
      to: contractAddresses[i],
      value: 0,
      // gasLimit: bn(args.maxGas),
      // gasPrice: parseGwei(args.gasPrice),
      chainId: args.chainId,
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
const testEdgecases = async (args: any, provider: JsonRpcProvider, txData: any[], mainWallet) => {
  let nonce = await mainWallet.getTransactionCount();
  let txResponses = [];
  console.log(`testing edgecases at ${provider.connection.url}...`)
  for (let i = 0; i < txData.length; i++){
    const tx = {
      nonce: nonce,
      // gasLimit: bn(args.maxGas),
      // gasPrice: parseGwei(args.gasPrice),
      chainId: args.chainId,
      data: txData[i]
    };
    const txResponse = await mainWallet.sendTransaction(tx);
    txResponses.push(txResponse.hash);
    nonce += 1;
  }
  return txResponses;
}

export {
  generateWallets,
  fundWallets,
  batchTxs,
  testOpcodes,
  testEdgecases
};