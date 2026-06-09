// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// SECURE: Disables initializers in the constructor of the logic contract, preventing ownership takeover.
contract SecureLogic {
    address public owner;
    bool public initialized;

    // SECURE: Disable initialization of implementation contract upon deployment
    constructor() {
        initialized = true;
        owner = address(1); // Block initialization on the logic contract
    }

    function initialize() external {
        require(!initialized, "Already initialized");
        owner = msg.sender;
        initialized = true;
    }

    function upgradeToAndCall(address newImplementation, bytes memory data) external payable {
        require(msg.sender == owner, "Not owner");
        (bool success, ) = newImplementation.delegatecall(data);
        require(success, "Upgrade failed");
    }
}
