import {ethers} from "ethers";

// Relative Imports
import {generateWallets, fundWallets, batchTxs, testOpcodes, testEdgecases} from "./helpers";
import {TransactionsMined} from "../../utilities/isTransactionMined";
import {JsonRpcProvider} from 'ethers/providers';
import {deployContracts, prepareTxData} from "../../utilities/build";
import {IEvmArgs} from "./index"

export const EVM = async (args: IEvmArgs) => {
  // Provider
  const provider: JsonRpcProvider = new ethers.providers.JsonRpcProvider(args.url);

  // Setup wallets
  const mainWallet = new ethers.Wallet(args.privateKey, provider);

  // TODO: Determine if this is still needed

  // const wallets = await generateWallets(numWallets);

  // Send fuel to subwallets
  // const txHashes: string[] = await fundWallets(wallets, mainWallet);

  // Wait for Transactions fueling subwallets to be mined
  // await TransactionsMined(txHashes, 500, provider);

  // Create and send transactions as specified in config
  // await batchTxs(wallets, provider);

  if (args.opcodes){
    // Deploy contracts from mainWallet
    const deployedContracts = await deployContracts(args, mainWallet);
    
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
    const responses = await testOpcodes(args, provider, addresses, mainWallet);

    await TransactionsMined(responses, 500, provider);

    // Log transaction reciepts
    for (let i = 0; i< responses.length; i++){
      let h = responses[i];
      await provider.getTransaction(h);
    }
  }

  if (args.edgeCases) {
    const edgecases = prepareTxData();
    const txResponses = await testEdgecases(args, provider, edgecases, mainWallet);
      // Log transaction reciepts
    for (let i = 0; i< txResponses.length; i++){
      let h = txResponses[i];
      await provider.getTransaction(h);
    }  

  }

};