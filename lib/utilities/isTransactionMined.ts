import {JsonRpcProvider} from "ethers/providers";

const TransactionsMined = async (
  txHashes: Array<string>,
  interval: number,
  provider: JsonRpcProvider
): Promise<void> => {
  return new Promise(async resolve => {
    let blockNums = [];
    for (let i: number = 0; i < txHashes.length; i++) {
      blockNums[i] = transactionRecieptExist(txHashes[i], interval, provider);
    }

    for (let i: number = 0; i < txHashes.length; i++) {
      await blockNums[i];
      console.log(`transaction mined! (hash: ${txHashes[i]})`)
    }
    console.log(`\n`);

    resolve();
  });
};

const transactionRecieptExist = async (
  txHash: string,
  interval: number,
  provider: JsonRpcProvider
) => {
  const txResponse = await provider.getTransaction(txHash);
  return new Promise(resolve => {
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

export { TransactionsMined };
