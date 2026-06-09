// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// VULNERABLE: Unprotected initializer, public upgradeTo, no access control
// Anyone can take over the contract
contract VulnerableUpgradeable {
    address public implementation;
    address public admin;
    uint256 public value;

    // VULNERABLE: Anyone can call initialize and become admin
    function initialize(address _implementation) external {
        require(admin == address(0), "Already initialized");
        admin = msg.sender;
        implementation = _implementation;
    }

    // VULNERABLE: No access control - anyone can upgrade
    function upgradeTo(address newImplementation) external {
        implementation = newImplementation;
    }

    // VULNERABLE: delegatecall without proper validation
    fallback() external payable {
        address impl = implementation;
        require(impl != address(0), "No implementation");
        assembly {
            let ptr := mload(0x40)
            calldatacopy(ptr, 0, calldatasize())
            let result := delegatecall(gas(), impl, ptr, calldatasize(), 0, 0)
            let size := returndatasize()
            returndatacopy(ptr, 0, size)
            switch result
            case 0 { revert(ptr, size) }
            default { return(ptr, size) }
        }
    }

    receive() external payable {}
}

// Simple logic contract for demonstration
contract LogicV1 {
    address public implementation;
    address public admin;
    uint256 public value;

    function setValue(uint256 _value) external {
        value = _value;
    }

    function getValue() external view returns (uint256) {
        return value;
    }
}
