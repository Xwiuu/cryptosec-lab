// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// VULNERABLE: Uses manipulable oracle, bad collateral math
contract VulnerableLending {
    mapping(address => uint256) public deposits;
    mapping(address => uint256) public borrows;
    address public oracle;
    uint256 public collateralFactor = 80; // 80% - VULNERABLE: too high

    constructor(address _oracle) {
        oracle = _oracle;
    }

    function deposit() external payable {
        deposits[msg.sender] += msg.value;
    }

    // VULNERABLE: Uses manipulable single-source oracle
    function borrow(uint256 amount) external {
        uint256 collateralValue = deposits[msg.sender];
        require(collateralValue > 0, "No collateral");

        // VULNERABLE: No check if oracle price is stale or manipulated
        uint256 maxBorrow = (collateralValue * collateralFactor) / 100;
        require(amount <= maxBorrow, "Exceeds max borrow");

        borrows[msg.sender] += amount;
        payable(msg.sender).transfer(amount);
    }

    // VULNERABLE: No health factor check, no liquidation mechanism
    function repay() external payable {
        require(borrows[msg.sender] >= msg.value, "Exceeds debt");
        borrows[msg.sender] -= msg.value;
    }

    receive() external payable {}
}
