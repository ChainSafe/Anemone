const ethers = require("ethers");

const TransactionsMined = async (txHashes: Array<any>, interval, provider) => {
  return new Promise(async (resolve, reject) => {
    let blockNums = [];
    for (let i: number = 0; i < txHashes.length; i++) {
      blockNums[i] = transactionRecieptExist(txHashes[i], interval, provider);
    }
    
    for (let i: number = 0; i < txHashes.length; i++) {
      await blockNums[i]
    }

    resolve();
  });
};

const transactionRecieptExist = async (txHash, interval, provider) => {
  var txResponse = await provider.getTransaction(txHash);
  return new Promise((resolve, reject) => {
    if (txResponse.blockNumber == null) {
      setTimeout(async function() {
        const temp = await transactionRecieptExist(txHash, interval, provider);
        resolve(temp);
      }, interval);
    } else {
      resolve(txResponse.blockNumber);
    }
  });
};

export {TransactionsMined};
