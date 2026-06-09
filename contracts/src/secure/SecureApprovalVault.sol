// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IERC20Minimal.sol";

// SECURE: Limited pull per deposit, explicit allowance checks, revoke mechanism
contract SecureApprovalVault {
    mapping(address => uint256) public deposits;
    mapping(address => mapping(address => uint256)) public depositLimits;
    mapping(address => bool) public operators;

    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyOperator() {
        require(operators[msg.sender] || msg.sender == owner, "Not authorized");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // SECURE: User explicitly approves exact amount being deposited
    function depositToken(address token, uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        IERC20Minimal(token).transferFrom(msg.sender, address(this), amount);
        deposits[msg.sender] += amount;
        depositLimits[msg.sender][token] += amount;
    }

    // SECURE: Can only withdraw up to user's deposit limit
    function withdrawToken(address token, address to, uint256 amount) external onlyOperator {
        require(depositLimits[to][token] >= amount, "Exceeds deposit limit");
        depositLimits[to][token] -= amount;
        deposits[to] -= amount;
        IERC20Minimal(token).transfer(to, amount);
    }

    // SECURE: User can revoke their own deposit limit
    function revokeAllowance(address token) external {
        uint256 remaining = depositLimits[msg.sender][token];
        if (remaining > 0) {
            depositLimits[msg.sender][token] = 0;
            IERC20Minimal(token).transfer(msg.sender, remaining);
            deposits[msg.sender] -= remaining;
        }
    }

    function addOperator(address op) external onlyOwner {
        operators[op] = true;
    }

    function removeOperator(address op) external onlyOwner {
        operators[op] = false;
    }

    function getDeposits(address user) external view returns (uint256) {
        return deposits[user];
    }
}
