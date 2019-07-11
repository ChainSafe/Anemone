"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TransactionsMined = void 0;

/*
* calls transactionRecieptExist for every transaction hash in array txHashes
*/
const TransactionsMined = async (txHashes, interval, provider) => {
  return new Promise(async resolve => {
    let blockNums = [];

    for (let i = 0; i < txHashes.length; i++) {
      blockNums[i] = transactionRecieptExist(txHashes[i], interval, provider);
    }

    for (let i = 0; i < txHashes.length; i++) {
      await blockNums[i];
      console.log(`transaction mined! (hash: ${txHashes[i]})`);
    }

    console.log(`\n`);
    resolve();
  });
};
/*
* Continuously polls provider every interval miliseconds until the transaction
* with transaction hash txHash is mined.
*/


exports.TransactionsMined = TransactionsMined;

const transactionRecieptExist = async (txHash, interval, provider) => {
  const txResponse = await provider.getTransaction(txHash);
  return new Promise(resolve => {
    if (txResponse.blockNumber == null) {
      setTimeout(async function () {
        const temp = await transactionRecieptExist(txHash, interval, provider);
        resolve(temp);
      }, interval);
    } else {
      resolve(txResponse.blockNumber);
    }
  });
};
//# sourceMappingURL=isTransactionMined.js.map