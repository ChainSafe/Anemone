import { Func } from "mocha";

const errors = require('web3-core-helpers').errors;
const jsonrpc = require("web3-core-requestmanager/src/jsonrpc");
const ethers = require("ethers");

export function parseError(result): Error {
	var message: string = !!result && !!result.error && !!result.error.message ? result.error.message : JSON.stringify(result);
	return new Error('Returned error: ' + message);
}

export interface IRunnerOpts {
	debug?: boolean;
	logger?: Function;
	onlyEndpoints?: boolean;
	allowFailures?: boolean;
}

interface IReportItem {
	implemented: boolean,
	required: boolean,
	result?: any,
}

export class Runner {
	report: {[name: string]: IReportItem} = {};
	debug: boolean = false;
	onlyEndpoints: boolean = false;
	logger: Function;
	allowFailures: boolean = false;
	failed: boolean = false; // True if a required parameter failed a test
	c: number = 0;

	constructor(opts: IRunnerOpts) {
		this.report = {};
		this.allowFailures = opts.allowFailures;
		this.debug = opts.debug
		this.logger = opts.logger || function(msg) {this.debug ? console.log(msg) : null};;
		this.onlyEndpoints = opts.onlyEndpoints;
		this.execute = this.execute.bind(this);
		this.update = this.update.bind(this);
	}

	jsonHandler(callback: Function, payload: any, expected: any, required: boolean) {
		return function(err, result) {
			if(result && result.id && payload.id !== result.id) {
				return callback(
					payload, 
					new Error(`Wrong response id ${result.id} (expected: ${payload.id}) in ${JSON.stringify(payload)}`),
					null,
					null,
					required
				);
			}
			if (err) {
				return callback(payload, err, null, null, required);
			}
			if (result && result.error) {
				return callback(payload, parseError(result), null, null, required);
			}
			if (!jsonrpc.isValidResponse(result)) {
				return callback(payload, errors.InvalidResponse(result), null, null, required);
			}
			callback(payload, null, result.result, expected, required);
		}
	};

	execute(payload: any, error, res: any, expected: any, required: boolean) {
		if (error && typeof error === 'string' && error.toLowerCase().includes("invalid json rpc response")) {
			throw new Error("JSON RPC Server not working!")
	
		}
		// Parse different error values
		let err;
		if (error && error.data && error.data.stack) {
			err = error.data.stack.toLowerCase();
		} else if (error && error.message) {
			err = error.message.toLowerCase();
		}

		if (err) {
			if (err.includes("not supported.") || err.includes("does not exist")) {
				this.logger(`[ERR] The method: ${payload.method} does not exist!`);
				this.update(payload.method, {
					implemented: false, 
					required,
					result: false
				});

			} else if (err.includes("missing value") || err.includes("incorrect number of arguments") || err.includes("cannot read")) {
				this.logger(`[ERR] The payload for: ${payload.method} was missing values: ${err}`);
				this.update(payload.method, {
					implemented: true,
					required,
					result: false
				});
			} else {
				this.logger(`[ERR] The method: ${payload.method} had an error we couldn't parse: ${err}`);
				this.update(payload.method, {
					implemented: false,
					required,
					result: false
				});

			}

		} else if (!this.onlyEndpoints && res !== expected) {
				this.logger(`[ERR] The method: ${payload.method} returned: ${res}, expected: ${expected}`)
				this.update(payload.method, { 
					implemented: true,
					required,
					result: false
				});

		} else {
			this.update(payload.method, {
				implemented: true,
				required,
				result: true
			});
		}
	}

	update(method: string, {implemented, required, result}: IReportItem) {
		if (!this.allowFailures && required && !implemented) {
			this.failed = true;
		}

		if (this.onlyEndpoints) {
			this.report[method] = {
				implemented,
				required
			}
		} else {
			this.report[method] = {
				implemented,
				required,
				result
			}
		}
	}

	log() {
		const table = [];
		for (let key in this.report) {
			const item = this.report[key];
			if (this.onlyEndpoints) {
				table.push({
					method: key, 
					implemented: item.implemented, 
					required: item.required
				})
			} else {
				table.push({
					method: key, 
					implemented: item.implemented, 
					returns: item.result, 
					required: item.required
				})
			}
		}
		console.table(table);
	}
}

export const executeTransfer = async (wallets, test) => {
	const w = wallets[test.from];
	await w.sendTransaction({
		to: test.to,
		value: ethers.utils.arrayify(test.amount)
	})
}