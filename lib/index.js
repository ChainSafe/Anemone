"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Main = void 0;

var _ethers = _interopRequireDefault(require("ethers"));

var _config = _interopRequireDefault(require("./config"));

var _attalus = require("./attalus");

var _isTransactionMined = require("./utilities/isTransactionMined");

var _buildContracts = require("./utilities/buildContracts");

// Relative Imports
const Main = async () => {
  // Provider
  const provider = (0, _attalus.connect)(_config.default.rpcUrl); // Constants

  const numWallets = _config.default.numWallets; // Setup wallets

  const mainWallet = new _ethers.default.Wallet(_config.default.funderPrivateKey, provider);
  const wallets = await (0, _attalus.generateWallets)(numWallets); // Send fuel to subwallets

  const txHashes = await (0, _attalus.fundWallets)(wallets, mainWallet); // Wait for Transactions fueling subwallets to be mined

  await (0, _isTransactionMined.TransactionsMined)(txHashes, 500, provider); // Create and send transactions as specified in config

  await (0, _attalus.batchTxs)(wallets, provider);

  if (_config.default.testOpCodes) {
    // Deploy contracts from mainWallet
    const deployedContracts = await (0, _buildContracts.deployContracts)(mainWallet); // Wait for transactions to be mined

    await (0, _isTransactionMined.TransactionsMined)(deployedContracts, 500, provider); //workaround for transactionresponse objects not having value "create"

    let addresses = [];

    for (let i = 0; i < deployedContracts.length; i++) {
      let h = deployedContracts[i];
      let a = await provider.getTransaction(h);
      addresses.push(a["creates"]);
    } //call testOpcodes for each deployed contract


    let responses = await (0, _attalus.testOpcodes)(provider, addresses, mainWallet);
    await (0, _isTransactionMined.TransactionsMined)(responses, 500, provider); // Log transaction reciepts

    for (let i = 0; i < responses.length; i++) {
      let h = responses[i];
      let a = await provider.getTransaction(h);
      console.log(a);
    }
  }
};

exports.Main = Main;
Main().then(() => {
  console.log("attalus executed without errors!");
}).catch(err => {
  console.log("attalus executed with errors: ", err);
});
//# sourceMappingURL=index.js.map