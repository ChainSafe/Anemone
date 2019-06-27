var Arithmetic = artifacts.require("./arithmetic.sol");
// var BooleanOperations = artifacts.require("./booleanOperations.sol");
// var Call = artifacts.require("./call.sol");
// // var Logs = artifacts.require("./logs.sol")
// // var CallCode = artifacts.require("./callcode.sol");
// var Comparators = artifacts.require("./comparators.sol")
// var CallOOG = artifacts.require("./CallOOG.sol");


let contractInstance
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

contract('', (accounts) => {
   beforeEach(async () => {
      contractInstance = await Arithmetic.deployed()
   })
   it('if this has errors we have problems', async () => {
    
     await contractInstance.testOpcodes()

   })
})