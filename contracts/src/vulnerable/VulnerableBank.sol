// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// VULNERABLE: Reentrancy - allows attacker to drain funds via callback
contract VulnerableBank {
    mapping(address => uint256) public balances;

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    // VULNERABLE: State is updated AFTER external call (checks-effects-interactions violated)
    // Uses unchecked math to demonstrate the classic reentrancy pattern
    // In Solidity <0.8, this would wrap around; here it simulates the concept
    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        (bool ok,) = msg.sender.call{value: amount}("");
        require(ok, "Transfer failed");
        unchecked {
            balances[msg.sender] -= amount;
        }
    }

    function getBalance() external view returns (uint256) {
        return balances[msg.sender];
    }

    receive() external payable {}
}
