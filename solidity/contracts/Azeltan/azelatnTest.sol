// things to test in this contract

contract AzeltanTest {

    // EIP-152: Add Blake2 compression function F precompile
    function testEIP152() {

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

        bytes memory args = abi.encodePacked(rounds, h[0], h[1], m[0], m[1], m[2], m[3], t[0], t[1], f);

        assembly {
            staticcall(not(0), 0x09, add(args, 32), 0xd5, output, 0x40)
        }

        
    }

    // EIP-1108: Reduce alt_bn128 precompile gas costs
    // Contract	        Address	Current Gas Cost	    Updated Gas Cost
    // ECADD	        0x06	500 	                150
    // ECMUL	        0x07	40 000          	    6 000
    // Pairing check	0x08	80 000 * k + 100 000    34 000 * k + 45 000
    function testEIP1108() {

        //TODO find valid keys :'(

        // call ECADD
        uint256[3] memory input1;
        input1[0] = 3;
        input1[1] = 5;
        input1[2] = 123;
        assembly {
            staticcall(gas, 0x06, input, 0x60, p, 0x40)
        }

        // call ECMUL
        // With a public key (x, y), ECMUL computes p = scalar * (x, y).
        uint256[3] memory input2;
        input2[0] = 3;
        input2[1] = 5;
        input2[2] = 123;
        assembly {
            call(gas, 0x07, input, 0x60, p, 0x40)
        }

        // call Pairing Check
        uint256[3] memory input2;
        input2[0] = 3;
        input2[1] = 5;
        input2[2] = 123;
        assembly {
            call(gas, 0x08, input, 0x60, p, 0x40)
        }


    }

    // EIP-1344: Add ChainID opcode
    function testEIP1344() {
        chainid();


    }

    // EIP-2028: Calldata gas cost reduction
    // From 68 gas per byte, to 16 gas per byte
    // so calldataload should cost 16 (gas) x 32 (bytes) or 512 gas now
    function testEIP2029() {
        assembly {
            let a:= mload(0x40)
            let b:= add(a, 32)
            // should have cost 512 gas
            calldataload(a)
        }

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

    function testEIP2200 () {
        uint256 startgas;
        uint256 endgas;

        // assert SLOAD gas cost changed to 800
        assembly{ 
            
            startgas := gas()
            SLOAD(storageuint_slot)
            endgas := gas()

            assert(SUB(startgas, endgas), 800)
            
        
        }

        // assert SSTORE only takes 20000 gas

        assembly{ 

            startgas := gas()
            SSTORE("a")
            endgas := gas()

            assert(SUB(startgas, endgas) == 800)


         }

        // assert RESET Takes 5000 gas

        assembly{ 

            MLOAD(0x40) // load the memory at the free pointer
            SSTORE(5)   // take this 
            RESET()
        
        
        
        }

        // assert CLEAT takes 8000 gas

        assembly {
            MLOAD(0x40)
        }

    }

}
