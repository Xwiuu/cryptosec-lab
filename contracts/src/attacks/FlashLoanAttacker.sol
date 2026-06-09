// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// EDUCATIONAL: Simulates a flash loan attack locally
// Uses a simple callback pattern to borrow, manipulate, and repay
contract FlashLoanAttacker {
    address public owner;
    bool public attacking;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // Attack function: borrow from pool, manipulate, repay in same tx
    function executeAttack(address pool, uint256 amount, bytes calldata attackData)
        external
        onlyOwner
        returns (bool)
    {
        attacking = true;
        (bool ok,) = pool.call{value: amount}(attackData);
        require(ok, "Attack failed");
        attacking = false;
        return true;
    }

    // Callback - called by flash loan pool during executeOperation
    function executeOperation(address pool, uint256 amount, uint256 fee, bytes calldata)
        external
        returns (bool)
    {
        // In a real attack: manipulate oracle, swap, vote
        // Then repay
        payable(pool).transfer(amount + fee);
        return true;
    }

    function withdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    receive() external payable {}
}
