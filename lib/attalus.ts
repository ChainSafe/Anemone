import {Wallet} from "ethers";

const ethers = require("ethers");
import {JsonRpcProvider} from "ethers/providers";
import config from "../config"

const connect = (url: string): JsonRpcProvider => {
  return new ethers.providers.JsonRpcProvider(url, "");
};

/*
*
*/

const generateWallets = async (num: number) => {
  const wallets = [];
  for (let i: number = 0; i < num; i++) {
    const wallet = new ethers.Wallet.createRandom();
    wallets.push(wallet);
    const address = await wallet.getAddress();
    console.log(`Created wallet with address ${address}`)
    
  }
  console.log('\n');
  return wallets;
};

const fundWallets = async (wallets: Array<any>, mainWallet: any): Promise<string[]> => {
  //send each wa]llet the max possible gas amount for each transaction + the amount of the transaction as specified in config
  const numTransactions = bn(config.numTransactions/config.numWallets);
  const transactionAmount = bn(config.amount).mul(numTransactions);
  const maxGasAmount = (bn(ethers.utils.parseUnits(config.gasPrice, "gwei")).mul(bn(config.maxGas))).mul(numTransactions);
  const amount = transactionAmount.add(maxGasAmount);

  const txHashes: string[] = [];
  const numWallets = wallets.length;
  let nonce = await mainWallet.getTransactionCount();
  for (let i: number = 0; i < numWallets; i++) {
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
    console.log(`sent transaction to fund address ${dest}`)
    txHashes.push(txResponse.hash);
    nonce += 1;
  }
  console.log(`\n`);

  return txHashes;

}


const batchTxs = async (wallets: Array<any>, provider: JsonRpcProvider) => {
  //we want to split the transactions equally among the wallets to be sent from.
  const numTransactions = bn(Math.ceil(config.numTransactions/config.numWallets));
  const amount = bn(config.amount);
  const txs: any = [];
  const numWallets = wallets.length; 
  console.log("Broadcasting transactions...") 
  for (let i: number = 0; i < wallets.length; i++) {
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
        data: "0x3039"
      };
      nonce += 1;
      sender.sendTransaction(tx);
      txs.push(tx); 
    }
    }
  console.log(`\nCreated and broadcasted ${txs.length} transactions.`);
  return txs;
};


const testOpcodes= async (provider: JsonRpcProvider, contractAddresses: Array<any>, wallet) => {
  for (let i = 0; i< contractAddresses.length; i++){
    const contract = new ethers.Contract(contractAddresses[i], config.abi, provider);
    let contractWithSigner = contract.connect(wallet);
    console.log(`called testOpcodes for contract at: ${contractAddresses[i]}`)
    await contractWithSigner.testOpcodes();
  }
  

}


/*
* Helper func
*
*/
const bn = (num: any) => {
  return ethers.utils.bigNumberify(num);
}

const parseGwei = (gwei: string) => {
  return ethers.utils.parseUnits(gwei, "gwei")
}

export {
  connect,
  generateWallets,
  fundWallets,
  batchTxs,
  testOpcodes
}