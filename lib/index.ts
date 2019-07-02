const ethers = require("ethers");

// Relative Imports
import config from "../config";
import {connect, generateWallets, fundWallets, batchTxs, testOpcodes} from "./attalus";
import {TransactionsMined} from "./utilities/isTransactionMined";
import {JsonRpcProvider} from 'ethers/providers';
import {compileContracts, deployContracts} from "./utilities/buildContracts";
//import {deployContracts} from "./utilities/deployContracts"

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

  if (config.testOpcodes){
    //compile contracts
    compileContracts();

    //deploy contracts from mainWallet
    const deployedContracts = await deployContracts(mainWallet);
    
    console.log(deployedContracts);
    
    //wait for transactions to be mined
    await TransactionsMined(Object.keys(deployContracts), 500, provider);  

    var contractAddresses = Object.keys(deployedContracts).map(function(e) {
      return deployedContracts[e]
    });

    //call testOpcodes for each deployed contract
    await testOpcodes(provider, contractAddresses, mainWallet);
  }

};
  


export default Main;