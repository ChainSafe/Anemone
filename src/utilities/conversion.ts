import * as ethers from 'ethers';

/*
* Takes num and returns Big Number
*/
const bn = (num: any) => {
  return ethers.utils.bigNumberify(num);
};
  
/*
* Takes gwei value and returns equivalent value in wei
*/ 
const parseGwei = (gwei: string) => {
  return ethers.utils.parseUnits(gwei, "gwei");
};

export {
  bn,
  parseGwei,
};