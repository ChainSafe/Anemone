import * as path from 'path';
import * as fs from 'fs-extra';
import * as ethers from 'ethers';
import config from "../config";
import {bn, parseGwei} from "./conversion";


/*
* Gets path to all sources within a directory in the form of a dictionary
* where the key references the name of the file, and the value is the file's path
*/
const getSources = (sourceDir) => {

  const sources = {};
  const contracts = fs.readdirSync(sourceDir);

  for (let i = 0; i < contracts.length; i++) {
    const contractName = contracts[i];
    const contractPath = path.resolve(sourceDir, contractName);
    if (!(fs.lstatSync(contractPath).isDirectory())){
      sources[contractName] = contractPath;
    }
  }

  return sources;
};


/*
* Deploys all the contract bytecode in the build folder from the wallet 
* with private key config.funderPrivateKey
*/
const deployContracts = async (mainWallet) => {

  const buildPath = path.resolve('solidity', 'build', 'contracts');
  const contractByteCodes = getSources(buildPath);
  const deployedAddresses = {};

  console.log(`Deploying contracts from address: ${await mainWallet.getAddress()}`);

  const txs: any = [];
  let nonce = await mainWallet.getTransactionCount();

  for (let bytecodePath in contractByteCodes){
    let contents = (fs.readFileSync(path.resolve(buildPath, bytecodePath), 'utf8')).replace(/(\r\n|\n|\r)/gm,"");
    const tx = {
      nonce: nonce,
      value: 0,
      gasLimit: bn(config.maxGas),
      gasPrice: parseGwei(config.gasPrice),
      chainId: config.chainId,
      data: contents
    };
    const txResponse = await mainWallet.sendTransaction(tx);
    txs.push(txResponse.hash);
    nonce += 1;
  }

  return txs;

};

const prepareTxData = () => {
  const buildPath = path.resolve('edgecases');
  const txDataSources = getSources(buildPath);
  const txData = []

  for (let sourcePath in txDataSources){
    let contents = (fs.readFileSync(path.resolve(buildPath, sourcePath),'utf8')).replace(/(\r\n|\n|\r)/gm,"");
    txData.push(contents)
  }

  return txData;

}

export {
  deployContracts,
  prepareTxData
};
