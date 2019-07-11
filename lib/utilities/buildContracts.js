"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.deployContracts = void 0;

var path = _interopRequireWildcard(require("path"));

var fs = _interopRequireWildcard(require("fs-extra"));

var _config = _interopRequireDefault(require("../config"));

var _conversion = require("./conversion");

/*
* Gets path to all sources within a directory in the form of a dictionary
* where the key references the name of the file, and the value is the file's path
*/
const getSources = sourceDir => {
  const sources = {};
  const contracts = fs.readdirSync(sourceDir);

  for (let i = 0; i < contracts.length; i++) {
    const contractName = contracts[i];
    const contractPath = path.resolve(sourceDir, contractName);

    if (!fs.lstatSync(contractPath).isDirectory()) {
      sources[contractName] = contractPath;
    }
  }

  return sources;
};
/*
* Deploys all the contract bytecode in the build folder from the wallet 
* with private key config.funderPrivateKey
*/


const deployContracts = async mainWallet => {
  const buildPath = path.resolve('solidity', 'build', 'contracts');
  const contractByteCodes = getSources(buildPath);
  const deployedAddresses = {};
  console.log(`Deploying contracts from address: ${await mainWallet.getAddress()}`);
  const txs = [];
  let nonce = await mainWallet.getTransactionCount();

  for (let bytecodePath in contractByteCodes) {
    let contents = fs.readFileSync(path.resolve(buildPath, bytecodePath));
    const tx = {
      nonce: nonce,
      value: 0,
      gasLimit: (0, _conversion.bn)(_config.default.maxGas),
      gasPrice: (0, _conversion.parseGwei)(_config.default.gasPrice),
      chainId: _config.default.chainId,
      data: contents
    };
    const txResponse = await mainWallet.sendTransaction(tx);
    txs.push(txResponse.hash);
    nonce += 1;
  }

  return txs;
};

exports.deployContracts = deployContracts;
//# sourceMappingURL=buildContracts.js.map