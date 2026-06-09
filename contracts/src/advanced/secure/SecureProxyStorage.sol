// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// SECURE: Uses EIP-1967 structured storage slots to prevent storage collisions.
contract SecureProxy {
    // bytes32(uint256(keccak256('eip1967.proxy.implementation')) - 1)
    bytes32 private constant IMPLEMENTATION_SLOT = 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;
    // bytes32(uint256(keccak256('eip1967.proxy.admin')) - 1)
    bytes32 private constant ADMIN_SLOT = 0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103;

    constructor(address _impl) {
        _setSlot(ADMIN_SLOT, bytes32(uint256(uint160(msg.sender))));
        _setSlot(IMPLEMENTATION_SLOT, bytes32(uint256(uint160(_impl))));
    }

    function implementation() public view returns (address impl) {
        bytes32 slot = IMPLEMENTATION_SLOT;
        assembly {
            impl := sload(slot)
        }
    }

    function admin() public view returns (address adm) {
        bytes32 slot = ADMIN_SLOT;
        assembly {
            adm := sload(slot)
        }
    }

    function _setSlot(bytes32 slot, bytes32 value) internal {
        assembly {
            sstore(slot, value)
        }
    }

    fallback() external payable {
        address impl = implementation();
        assembly {
            calldatacopy(0, 0, calldatasize())
            let result := delegatecall(gas(), impl, 0, calldatasize(), 0, 0)
            returndatacopy(0, 0, returndatasize())
            switch result
            case 0 { revert(0, returndatasize()) }
            default { return(0, returndatasize()) }
        }
    }
}

contract SecureImplementation {
    // Normal variables stored at slot 0 and 1, completely safe from proxy eip1967 slots.
    uint256 public value;
    address public owner;

    function setValue(uint256 _value) external {
        value = _value;
    }

    function setOwner(address _owner) external {
        owner = _owner;
    }
}
