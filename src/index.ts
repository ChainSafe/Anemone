import {ethers} from "ethers";

// Relative Imports
import config from "./config";
import {connect, generateWallets, fundWallets, batchTxs, testOpcodes, testEdgecases} from "./attalus";
import {TransactionsMined} from "./utilities/isTransactionMined";
import {JsonRpcProvider} from 'ethers/providers';
import {deployContracts, prepareTxData} from "./utilities/build";
import {parseArgs} from "./utilities/parseArgs";
import { exists } from "fs";

export const Main = async () => {
  //set up args
  let [rpcUrl, pk] = parseArgs();

  // Provider
  let provider: JsonRpcProvider;

  if (rpcUrl !=null) {
    provider = connect(rpcUrl);
  } else {
    provider = connect(config.rpcUrl);
  }

  // Constants
  const numWallets: number = config.numWallets;
  // Setup wallets
  let mainWallet;

  if (pk !=null) {
    mainWallet = new ethers.Wallet(pk, provider);
  } else {
    console.log("Please provide valid private key!")
    process.exit();
  }

  const wallets = await generateWallets(numWallets);

  // Send fuel to subwallets
  const txHashes: string[] = await fundWallets(wallets, mainWallet);

  // Wait for Transactions fueling subwallets to be mined
  await TransactionsMined(txHashes, 500, provider);

  // Create and send transactions as specified in config
  await batchTxs(wallets, provider);

  if (config.testOpCodes){

    // Deploy contracts from mainWallet
    const deployedContracts = await deployContracts(mainWallet);
    
    // Wait for transactions to be mined
    await TransactionsMined(deployedContracts, 500, provider);  

    //workaround for transactionresponse objects not having value "create"
    const addresses = [];
    for (let i = 0; i< deployedContracts.length; i++){
      let h = deployedContracts[i];
      let a = await provider.getTransaction(h);
      addresses.push(a["creates"]);
    }

    //call testOpcodes for each deployed contract
    const responses = await testOpcodes(provider, addresses, mainWallet);

    await TransactionsMined(responses, 500, provider);

    // Log transaction reciepts
    for (let i = 0; i< responses.length; i++){
      let h = responses[i];
      let a = await provider.getTransaction(h);
      console.log(a);
    }
  }

  if (config.testEdgecases) {
    const edgecases = prepareTxData();
    const txResponses = await testEdgecases(provider, edgecases, mainWallet);
      // Log transaction reciepts
    for (let i = 0; i< txResponses.length; i++){
      let h = txResponses[i];
      let a = await provider.getTransaction(h);
      console.log(a);
    }  

  }

};

Main()
  .then(() => { console.log("attalus executed without errors!");})
  .catch((err: any) => { console.log("attalus executed with errors: ", err);});