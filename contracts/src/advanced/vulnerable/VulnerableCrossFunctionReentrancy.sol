// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// VULNERABLE: Cross-Function Reentrancy.
// Two different functions modify the same state without mutual locks.
contract VulnerableCrossFunctionReentrancy {
    mapping(address => uint256) public balances;

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    // VULNERABLE: Withdraws balance before updating it to 0.
    // An attacker can reenter via fallback and call transferBalance() to move the same balance.
    function withdrawAll() external {
        uint256 bal = balances[msg.sender];
        require(bal > 0, "No balance");

        (bool success, ) = msg.sender.call{value: bal}("");
        require(success, "Withdraw failed");

        balances[msg.sender] = 0;
    }

    // Transfers balance to another address
    function transfer(address to, uint256 amount) external {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        balances[to] += amount;
    }
}
