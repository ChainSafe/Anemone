"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.testOpcodes = exports.batchTxs = exports.fundWallets = exports.generateWallets = exports.connect = void 0;

var _ethers = _interopRequireDefault(require("ethers"));

var _config = _interopRequireDefault(require("./config"));

var _conversion = require("./utilities/conversion");

const connect = url => {
  return new _ethers.default.providers.JsonRpcProvider(url, "");
};
/*
* Generates num wallets
*/


exports.connect = connect;

const generateWallets = async num => {
  const wallets = [];

  for (let i = 0; i < num; i++) {
    const wallet = _ethers.default.Wallet.createRandom();

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


exports.generateWallets = generateWallets;

const fundWallets = async (wallets, mainWallet) => {
  //send each wa]llet the max possible gas amount for each transaction + the amount of the transaction as specified in config
  const numTransactions = (0, _conversion.bn)(_config.default.numTransactions / _config.default.numWallets);
  const transactionAmount = (0, _conversion.bn)(_config.default.amount).mul(numTransactions);
  const maxGasAmount = (0, _conversion.bn)(_ethers.default.utils.parseUnits(_config.default.gasPrice, "gwei")).mul((0, _conversion.bn)(_config.default.maxGas)).mul(numTransactions);
  const amount = transactionAmount.add(maxGasAmount);
  const txHashes = [];
  const numWallets = wallets.length;
  let nonce = await mainWallet.getTransactionCount();

  for (let i = 0; i < numWallets; i++) {
    const dest = await wallets[i].getAddress();
    const tx = {
      nonce: nonce,
      value: amount,
      to: dest,
      gasLimit: (0, _conversion.bn)(_config.default.maxGas),
      gasPrice: (0, _conversion.parseGwei)(_config.default.gasPrice),
      chainId: _config.default.chainId
    };
    const txResponse = await mainWallet.sendTransaction(tx);
    console.log(`sent transaction to fund address ${dest}`);
    txHashes.push(txResponse.hash);
    nonce += 1;
  }

  console.log(`\n`);
  return txHashes;
};
/*
* Creates and broadcasts batches of transactions from wallets in array wallets to provider
*/


exports.fundWallets = fundWallets;

const batchTxs = async (wallets, provider) => {
  //we want to split the transactions equally among the wallets to be sent from.
  const numTransactions = Math.ceil(_config.default.numTransactions / _config.default.numWallets);
  const amount = (0, _conversion.bn)(_config.default.amount);
  const txs = [];
  const numWallets = wallets.length;
  console.log("Broadcasting transactions...");

  for (let i = 0; i < wallets.length; i++) {
    const sender = new _ethers.default.Wallet(wallets[i].privateKey, provider);
    let nonce = 0;

    for (let j = 0; j < numTransactions; j++) {
      //"randomly" select wallet among created wallets to receive transaction
      const destIndex = Math.floor(Math.random() * numWallets);
      const dest = await wallets[destIndex].getAddress();
      const tx = {
        nonce: nonce,
        value: amount,
        to: dest,
        gasLimit: (0, _conversion.bn)(_config.default.maxGas),
        gasPrice: (0, _conversion.parseGwei)(_config.default.gasPrice),
        chainId: _config.default.chainId
      };
      nonce += 1;
      sender.sendTransaction(tx);
      txs.push(tx);
    }
  }

  console.log(`\nCreated and broadcasted ${txs.length} transactions.`);
  return txs;
};
/*
* Broadcasts transactions from mainWallet to provider to call testOpcodes() at all known deployed contract addresses
*/


exports.batchTxs = batchTxs;

const testOpcodes = async (provider, contractAddresses, mainWallet) => {
  let nonce = await mainWallet.getTransactionCount();
  let txResponses = [];
  console.log("calling testOpcodes...");

  for (let i = 0; i < contractAddresses.length; i++) {
    const tx = {
      nonce: nonce,
      to: contractAddresses[i],
      value: 0,
      gasLimit: (0, _conversion.bn)(_config.default.maxGas),
      gasPrice: (0, _conversion.parseGwei)(_config.default.gasPrice),
      chainId: _config.default.chainId,
      //ABI for all contracts is the same, testOpcodes is 0x391521f4
      data: "0x391521f4"
    };
    const txResponse = await mainWallet.sendTransaction(tx);
    txResponses.push(txResponse.hash);
    nonce += 1;
  }

  return txResponses;
};

exports.testOpcodes = testOpcodes;
//# sourceMappingURL=attalus.js.map