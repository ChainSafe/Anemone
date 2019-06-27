import {providers} from "ethers";
const ethers = require("ethers");
import {JsonRpcProvider} from "ethers/providers";
import { resolve } from "url";


const TransactionsMined = async (txHashes: Array<any>, interval, provider) => {
    return new Promise(async (resolve, reject) => {
    const blockNum = null;
    for (let i: number = 0; i < txHashes.length; i++) {
        console.log(`blocknum: start`);
        let blockNum = await transactionRecieptExist(txHashes[i], interval, provider);
        console.log(`blocknum: ${blockNum}`);
    };

    let b = await blockNum;
    resolve(b);

});
  
  }

//
const transactionRecieptExist = async (txHash, interval, provider) => {
        var txResponse = await provider.getTransaction(txHash);
        console.log(`response 1: ${txResponse.blockNumber}$`);
        return new Promise((resolve, reject) => {
        if (txResponse.blockNumber == null){
                setTimeout(async function () {
                    await transactionRecieptExist(txHash, interval, provider);
                }, interval); 
        } else {
            console.log(`response 2: ${txResponse.blockNumber}$`);
            resolve(txResponse.blockNumber);
        }});

}

export {
    TransactionsMined
  }
