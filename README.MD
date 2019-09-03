# Anemone

Anemone is a testing tool that broadcasts batches of transactions and tests opcodes.

## Config Values

   **rpcUrl:** Url to node open for RPC, defaults to default localhost port, **string**

   **numTransactions:** number of transactions to generate and throw, **string**

   **numWallets:** number of wallets that will be created to throw/recieve transactions, **string**

   **testOpCodes:**    set true to deploy and test the smart contracts containing each opcode, **boolean**

   **amount:** value (in wei) to send in each transaction, **string**    

   **gasPrice:** gas price in gwei to set for each transaction, **string**
   
   **maxGas:** max gas to set for each transaction generated, **string**

   **chainId:** chainId, **num**
## Set-up
* run `yarn install`

## Start

### Flags
**--pk** Private key, takes private key of wallet that will fund the other sender wallet and deploy opcode contracts.

**--rpcport** (Optional), specify url to node open for RPC, defaults to config value

* Must have rpc port exposed on running geth instance.
* Must ensure the account associated with the private key provided is sufficiently funded
* run `yarn start --pk YOUR_PRIVATE_KEY`

**Please ensure that the account associated with the private key provided is sufficiently funded**

