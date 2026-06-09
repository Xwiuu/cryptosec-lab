// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// VULNERABLE: Proxy Storage Collision
// The Proxy stores state at slot 0 and 1, but the Implementation has a different storage layout,
// causing delegatecalls to corrupt the proxy's storage.
contract VulnerableProxy {
    // Slot 0: implementation
    // Slot 1: admin
    address public implementation;
    address public admin;

    constructor(address _impl) {
        implementation = _impl;
        admin = msg.sender;
    }

    fallback() external payable {
        address impl = implementation;
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

contract VulnerableImplementation {
    // Slot 0: value (which overlaps with proxy's implementation address!)
    // Slot 1: owner (which overlaps with proxy's admin address!)
    uint256 public value;
    address public owner;

    function setValue(uint256 _value) external {
        value = _value; // Overwrites slot 0 (implementation!)
    }

    function setOwner(address _owner) external {
        owner = _owner; // Overwrites slot 1 (admin!)
    }
}
