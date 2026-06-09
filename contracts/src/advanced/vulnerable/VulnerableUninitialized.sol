// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// VULNERABLE: Uninitialized implementation.
// The Logic contract's constructor is empty, allowing anyone to initialize the implementation contract directly.
// If the Logic contract has UUPS upgradeability (delegatecall under authorization), the attacker can call delegatecall
// to a malicious contract that runs selfdestruct, bricking all proxies.
contract VulnerableLogic {
    address public owner;
    bool public initialized;

    // VULNERABLE: Implementation contract is deployed but constructor doesn't disable initializers.
    // Anyone can call initialize on the Logic contract itself.
    function initialize() external {
        require(!initialized, "Already initialized");
        owner = msg.sender;
        initialized = true;
    }

    // VULNERABLE: UUPS upgrade function that allows delegatecall to perform upgrades.
    // Since the attacker can become owner of the logic contract, they can trigger this delegatecall on the logic contract itself.
    function upgradeToAndCall(address newImplementation, bytes memory data) external payable {
        require(msg.sender == owner, "Not owner");
        
        // Delegatecall to perform initialization on the new implementation
        (bool success, ) = newImplementation.delegatecall(data);
        require(success, "Upgrade failed");
    }
}
