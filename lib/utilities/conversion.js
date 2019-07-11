"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseGwei = exports.bn = void 0;

var ethers = _interopRequireWildcard(require("ethers"));

/*
* Takes num and returns Big Number
*/
const bn = num => {
  return ethers.utils.bigNumberify(num);
};
/*
* Takes gwei value and returns equivalent value in wei
*/


exports.bn = bn;

const parseGwei = gwei => {
  return ethers.utils.parseUnits(gwei, "gwei");
};

exports.parseGwei = parseGwei;
//# sourceMappingURL=conversion.js.map