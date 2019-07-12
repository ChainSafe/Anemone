// Relative imports
import Main from './lib';

Main()
  .then(() => { console.log("attalus executed without errors!")})
  .catch((err: any) => { console.log("attalus executed with errors: ", err)});