// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VulnerableUpgradeable {
    address public implementation;
    address public admin;

    function initialize(address _implementation) external {
        require(admin == address(0), "Already initialized");
        admin = msg.sender;
        implementation = _implementation;
    }

    function upgradeTo(address newImplementation) external {
        implementation = newImplementation;
    }

    function delegatecallToTarget(bytes memory data) external returns (bytes memory) {
        (bool success, bytes memory result) = implementation.delegatecall(data);
        require(success, "Delegatecall failed");
        return result;
    }

    fallback() external payable {
        address impl = implementation;
        require(impl != address(0), "Implementation not set");
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
}
