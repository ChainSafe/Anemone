import * as path from 'path';
import * as fs from 'fs-extra';
import * as solc from 'solc';
import * as ethers from 'ethers';
import config from "../../config";

//compile contracts
//
const compileContracts = () => {
    const buildPath = path.resolve('solidity', 'contracts', 'build');
    const contractsPath = path.resolve('solidity', 'contracts');
    fs.emptyDirSync(buildPath);

    const solcInput = JSON.stringify({
        "language": 'Solidity',
        "sources": getSources(contractsPath),
        "settings": {
            "outputSelection": {
                '*': {
                    //we only need the bytecode, abi is the same for each contract
                    '*': [ 'evm.bytecode' ]
                }
            }
        }
    })

    const compiledContracts = solc.compile(solcInput);
    console.log(compiledContracts);

	for (let contract in compiledContracts) {
		for(let contractName in compiledContracts[contract]) {
            console.log("here");
			fs.outputJsonSync(
				path.resolve(buildPath, `${contractName}.json`),
				compiledContracts[contract][contractName],
				{
					spaces: 2
                }

			)
		}
    }
}


//helpers

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

}

const getImports = (contract) => {

    switch (contract) {
        case 'CalledContract.sol':
            return {contents: fs.readFileSync(path.resolve('solidity', 'contracts', 'Abstracts', 'CalledContract.sol'), 'utf8')};

        case 'TestContractInterface.sol':
            return {contents: fs.readFileSync(path.resolve('solidity', 'contracts', 'Abstracts', 'TestContractInterface.sol'), 'utf8')};
        default:
            return {error: 'File not found'}
    }

}

const deployContracts = async (wallet) => {

    const buildPath = path.resolve('solidity', 'build', 'contracts');
    const contractByteCodes = getSources(buildPath);
    const deployedAddresses = {};

    console.log(`Deploying contracts from address: ${await wallet.getAddress()}`);

    const txs: any = [];
    let nonce = await wallet.getTransactionCount();

    for (let bytecodePath in contractByteCodes){
        console.log("here");
        let contents = fs.readFileSync(path.resolve(buildPath, bytecodePath));
        const tx = {
            nonce: nonce,
            value: 0,
            gasLimit: 210000,
            gasPrice: 40000000000,
            chainId: config.chainId,
            data: contents
        };
        const txResponse = await wallet.sendTransaction(tx);
        txs.push(txResponse.hash);
        nonce += 1;
    }

    return txs;

}
export {
    compileContracts,
    deployContracts
}
