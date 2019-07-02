import * as path from 'path';
import * as fs from 'fs-extra';
import * as solc from 'solc';
import * as ethers from 'ethers';

//compile contracts
const compileContracts = () => {
    const buildPath = path.resolve('solidity', 'contracts', 'build');
    const contractsPath = path.resolve('solidity', 'contracts');
    fs.emptyDirSync(buildPath);

    const solcInput = {
        language: 'Solidity',
        sources: getSources(contractsPath),
        settings: {
            outputSelection: {
                '*': {
                    //we only need the bytecode, abi is the same for each contract
                    '*': [ 'evm.bytecode' ]
                }
            }
        }
    }
    console.log(getSources(contractsPath));

    const compiledContracts = solc.compile(JSON.stringify(solcInput)).contracts;
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
        const contractName = contracts[i]
        sources[contractName] = path.resolve(sourceDir, contractName);
    }

    return sources;

}

const deployContracts = async (wallet) => {

    //human readable abi
    const abi = [
        "modifier Owner (address _owner)",
        "function testOpcodes()",
        "function test_revert()",
        "function test_invalid()",
        "function test_stop()"
    ];

    const buildPath = path.resolve('solidity', 'contracts', 'build');
    const contractByteCodes = getSources(buildPath);
    const deployedAddresses = {};
    //const txhashes = [];

    console.log(`Deploying contracts from address: ${wallet.getAddress()}`);

    for (let bytecode in contractByteCodes){
        let factory = new ethers.ContractFactory(abi, bytecode, wallet);
        let contract = await factory.deploy();
        deployedAddresses[contract.deployTransaction.hash] = contract.address;

    }

    return deployedAddresses;

}


export {
    compileContracts,
    deployContracts
}
