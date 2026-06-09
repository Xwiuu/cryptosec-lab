// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../vulnerable/VulnerableReadonlyAMM.sol"; // imports ReentrancyGuard

// SECURE: Uses Checks-Effects-Interactions and/or nonReentrant guard on modifying functions.
contract SecureCrossFunctionReentrancy is ReentrancyGuard {
    mapping(address => uint256) public balances;

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    // SECURE: Update state before interaction
    function withdrawAll() external nonReentrant {
        uint256 bal = balances[msg.sender];
        require(bal > 0, "No balance");

        balances[msg.sender] = 0; // Effect first

        (bool success, ) = msg.sender.call{value: bal}(""); // Interaction last
        require(success, "Withdraw failed");
    }

    // SECURE: Guarded against reentrancy and uses safe state checks
    function transfer(address to, uint256 amount) external nonReentrant {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        balances[to] += amount;
    }
}
