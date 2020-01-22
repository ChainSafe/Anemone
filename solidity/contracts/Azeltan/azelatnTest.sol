pragma solidity ^0.6.1;

contract AzeltanTest {

    // EIP-152: Add Blake2 compression function F precompile
    function testEIP152() public {

        uint32 rounds = 12;

        bytes32[2] memory h;
        h[0] = hex"48c9bdf267e6096a3ba7ca8485ae67bb2bf894fe72f36e3cf1361d5f3af54fa5";
        h[1] = hex"d182e6ad7f520e511f6c3e2b8c68059b6bbd41fbabd9831f79217e1319cde05b";

        bytes32[4] memory m;
        m[0] = hex"6162630000000000000000000000000000000000000000000000000000000000";
        m[1] = hex"0000000000000000000000000000000000000000000000000000000000000000";
        m[2] = hex"0000000000000000000000000000000000000000000000000000000000000000";
        m[3] = hex"0000000000000000000000000000000000000000000000000000000000000000";

        bytes8[2] memory t;
        t[0] = hex"03000000";
        t[1] = hex"00000000";

        bool f = true;
        
        bytes32[2] memory output;

        bytes memory args = abi.encodePacked(rounds, h[0], h[1], m[0], m[1], m[2], m[3], t[0], t[1], f);

        assembly {
            if iszero(staticcall(not(0), 0x09, add(args, 32), 0xd5, output, 0x40)) {
                revert(0,0)
            }
        }

        
    }
    
    
    // EIP-1108: Reduce alt_bn128 precompile gas costs
    // Contract	        Address	Current Gas Cost	    Updated Gas Cost
    // ECADD	        0x06	500 	                150
    // ECMUL	        0x07	40 000          	    6 000
    // Pairing check	0x08	80 000 * k + 100 000    34 000 * k + 45 000
    
    function testEIP1108_ECADD() public {
        // call ECADD
        uint256[4] memory input1;
        input1[0] = 0;
        input1[1] = 0;
        input1[2] = 0;
        input1[3] = 0;
        uint[2] memory p1;
        uint gasConsumed;
        assembly {
            let startgas := gas()
            if iszero(staticcall(gas(), 0x06, input1, 0x60, p1, 0x40)) {
                revert(0,0)
            }
            let endgas := gas()
            
            gasConsumed := sub(startgas, endgas)
        
        }
        // gas used for this should be 500 (cost of precompile) + 12*4 (4 words as parameters) + 700 (cost of staticcall) + 2 (cost of gas())
        assert(gasConsumed == 1250);
        
    }
    
    function testEIP1108_EMUL() public {
        uint256[3] memory input2;
        input2[0] = 0;
        input2[1] = 0;
        input2[2] = 1;
        uint[2] memory p2;
        uint gasConsumed;
        assembly {
            let startgas := gas()
            if iszero(staticcall(gas(), 0x07, input2, 0x60, p2, 0x40)) {
                revert(0,0)
            }
            let endgas := gas()
            
            gasConsumed := sub(startgas, endgas)
        }
        
        // gas used for this should be 6000 (cost of precompile) + 12*3 (3 words as parameters) + 700 (cost of staticcall) + 2 (cost of gas())
        
        assert(gasConsumed == 6738);
        
    }
    
    // function testEIP1108_PAIRINGCHECK() public {
    //     //NEED TO FIND VALID BYTESTREAM
    //     bytes memory input;
    //     uint256 len = input.length;
    //     require(len % 192 == 0);
    //     uint memory p3;
    //     assembly {
    //         if iszero(staticcall(gas(), 0x08, add(input, 0x20), len, p3, 0x20)) {
    //             revert(0,0)
    //         }
    //     }
        
    // }


    // EIP-1344: Add ChainID opcode
    function testEIP1344() public{
        assembly {
            pop(chainid())
        }


    }

    // EIP-2028: Calldata gas cost reduction
    // From 68 gas per byte, to 16 gas per byte
    // so calldataload should cost 16 (gas) x 32 (bytes) or 512 gas now
    function testEIP2029() public {
        
        uint gasConsumed;
        assembly {
            let a:= mload(0x40)
            let b:= add(a, 32)
            // should have cost 512 gas
            let startgas := gas()
            pop(calldataload(a))
            let endgas := gas()
            
            gasConsumed := sub(startgas, endgas)
        }
        
        
        // gas used for this should be 512(16 * 32) + 12*1 (1 word as parameter) + 2 (cost of gas()) + 2 (pop())
        assert(gasConsumed == 528);

    }

    // EIP-2200: Rebalance net-metered SSTORE gas cost with consideration of SLOAD gas cost change
    // Define variables SLOAD_GAS, SSTORE_SET_GAS, SSTORE_RESET_GAS and SSTORE_CLEARS_SCHEDULE. The old and new values for those variables are:

    //     SLOAD_GAS: changed from 200 to 800.
    //     SSTORE_SET_GAS: 20000, not changed.
    //     SSTORE_RESET_GAS: 5000, not changed.
    //     SSTORE_CLEARS_SCHEDULE: 15000, not changed.

    //     If gasleft is less than or equal to gas stipend, fail the current call frame with ‘out of gas’ exception.
    //     If current value equals new value (this is a no-op), SLOAD_GAS is deducted.
    //     If current value does not equal new value
    //         If original value equals current value (this storage slot has not been changed by the current execution context)
    //             If original value is 0, SSTORE_SET_GAS is deducted.
    //             Otherwise, SSTORE_RESET_GAS gas is deducted. If new value is 0, add SSTORE_CLEARS_SCHEDULE gas to refund counter.
    //         If original value does not equal current value (this storage slot is dirty), SLOAD_GAS gas is deducted. Apply both of the following clauses.
    //             If original value is not 0
    //                 If current value is 0 (also means that new value is not 0), remove SSTORE_CLEARS_SCHEDULE gas from refund counter.
    //                 If new value is 0 (also means that current value is not 0), add SSTORE_CLEARS_SCHEDULE gas to refund counter.
    //             If original value equals new value (this storage slot is reset)
    //                 If original value is 0, add SSTORE_SET_GAS - SLOAD_GAS to refund counter.
    //                 Otherwise, add SSTORE_RESET_GAS - SLOAD_GAS gas to refund counter.

    uint storageuint;
    
    function testEIP2200_SLOAD_GAS() public {
        // assert SLOAD gas cost changed to 800
        // If current value equals new value (this is a no-op), SLOAD_GAS is deducted.
    
        uint gasConsumed;
        assembly{ 
            
            let startgas := gas()
            pop(sload(storageuint_slot))
            let endgas := gas()
            
            gasConsumed := sub(startgas, endgas)
        
        }
        
        // gas used for this should be 800 (sload) + 2 (gas()) + 2 (pop())
        // if that doesnt work try 800 + 12 + 2 + 2
        assert(gasConsumed == 804);
        
        
    }
    
    function testEIP2200_SSTORE_GAS() public {
        
        // assert SSTORE only takes 20000 gas
        // If original value is 0, SSTORE_SET_GAS is deducted.
        
        uint gasConsumed;
        
        assembly{

            let startgas := gas()
            // storageuint is uninitialized, original value in slot should be 0
            sstore(storageuint_slot, 1)
            let endgas := gas()
            
            gasConsumed := sub(startgas, endgas)

         }
         
        // gas used for this should be 20000 (sstore) + 2 (gas()) + 12*1 (1 word)
        // if that doesnt work try 20000 + 2 + 24
        assert(gasConsumed == 20014);
        
    }


}
