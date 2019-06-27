import "./Abstracts/TestContractInterface.sol";

contract Staticcall is TestContractInterface {


  function testOpcodes() public {

    assembly{


        //expect this to pop 1 off the stack
        pop(staticcall(
                        5000, //gas
                        0x23, //address
                        0   , //argoffset
                        0   , //argslength
                        0   , //return offset
                        0     //return length

        ))

        

    }

  }
  
}