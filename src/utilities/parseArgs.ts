  //set up args

  //RPCurl
  const parseArgs = () => {
    const rpcUrlIndex = process.argv.indexOf('--rpcport');
    let rpcUrlVal;
    if (rpcUrlIndex > -1) {
        rpcUrlVal = process.argv[rpcUrlIndex + 1];
    }

    const pkIndex = process.argv.indexOf('--pk');
        let pkVal;
    if (pkIndex > -1) {
        pkVal = process.argv[pkIndex + 1];
    }

    return rpcUrlVal, pkVal
    }

export {
    parseArgs
};

