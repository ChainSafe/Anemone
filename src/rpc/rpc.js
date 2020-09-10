const errors = require('web3-core-helpers').errors;
const jsonrpc = require("web3-core-requestmanager/src/jsonrpc");
const transport = require("web3-providers-http");
const ethers = require("ethers");

function jsonHandler(callback, payload, expected) {
	return function(err, result) {
		if(result && result.id && payload.id !== result.id) {
			return callback(payload, new Error(`Wrong response id ${result.id} (expected: ${payload.id}) in ${JSON.stringify(payload)}`));
		}

		if (err) {
			return callback(payload, err);
		}

		if (result && result.error) {
			return callback(payload, errors.ErrorResponse(result));
		}

		if (!jsonrpc.isValidResponse(result)) {
			return callback(payload, errors.InvalidResponse(result));
		}
		callback(payload, null, result.result, expected);
	}
};

class Runner {
	constructor(onlyEndpoints = false) {
		this.report = {};
		this.onlyEndpoints = onlyEndpoints;
		this.execute = this.execute.bind(this);
		this.update = this.update.bind(this);
	}

	execute(payload, err, res, expected) {
		if (err && typeof err === 'string' && err.includes("Invalid JSON RPC response:")) {
			throw new Error("JSON RPC Server not working!")
		} else if (err && err.data && err.data.stack.includes("Method " + payload.method + " not supported.")) {
			console.log(`[ERR] The method: ${payload.method} does not exist!`);
			this.update(payload.method, false, false);
		} else if (err) {
			console.log(`[ERR] The method: ${payload.method} had an error we couldn't parse: ${err}`);
			this.update(payload.method, false, false);
		} else if (res !== expected) {
			console.log(`[ERR] The method: ${payload.method} returned: ${res}, expected: ${expected}`)
			this.update(payload.method, true, false);
		} else {
			this.update(payload.method, true, true);
		}
	}

	update(method, implemented, result) {
		if (this.onlyEndpoints) {
			this.report[method] = {
				implemented
			}
		} else {
			this.report[method] = {
				implemented,
				result
			}
		}
	}

	log() {
		const table = [];
		for (let key in this.report) {
			const item = this.report[key];
			if (this.onlyEndpoints) {
				table.push({method: key, implemented: item.implemented})
			} else {
				table.push({method: key, implemented: item.implemented, returns: item.result})
			}
		}
		console.table(table);
	}
}

/**
 * Simple Runner
 */
(async () => {
	const ganache = "0xb1157e88556d967936019ff60145276bd6618b9e2a67e505b79a1b50b47fd0f5"
	const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
	let mainWallet = new ethers.Wallet(ganache, provider);

	const json = require("./endpoints.json");

	const r = new Runner(true)
	const t = new transport();

	// fund and generate new wallets
	const stateKeys = json.state.keys;
	const testWallets = {};

	for (let i = 0; i < stateKeys.length; i++) {
		// fund the account
		await mainWallet.sendTransaction({
			to: stateKeys[i].address,
			value: ethers.utils.parseEther(stateKeys[i].balance)
		})

		// Create the new wallet
		testWallets[stateKeys[i].address] = new ethers.Wallet("0x" + stateKeys[i].pkey, provider);
	}

	const testCases = json.tests;
	for (let i = 0; i < json.tests.length; i++) {
		const test = testCases[i];
		if (test.stateChange && test.stateChange.length > 0) {
			for (let j = 0; j < test.stateChange.length; j++) {
				if (test.stateChange[j].type === "transfer") {
					console.log("executed state change")
					await executeTransfer(testWallets, test.stateChange[j]);
				}
			}
		}
		const payload = jsonrpc.toPayload(test.method, test.params);
		t.send(payload, jsonHandler(r.execute, payload, test.expected));
	}
	setTimeout(() => r.log(), 5000);
})();

executeTransfer = async (wallets, test) => {
	const w = wallets[test.from];
	await w.sendTransaction({
		to: test.to,
		value: ethers.utils.arrayify(test.amount)
	})
}