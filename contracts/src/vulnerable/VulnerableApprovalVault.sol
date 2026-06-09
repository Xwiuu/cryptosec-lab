// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IERC20Minimal.sol";

// VULNERABLE: Accepts infinite approval and can drain user tokens
// No per-deposit limits, no explicit pull limitation
contract VulnerableApprovalVault {
    mapping(address => uint256) public deposits;
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // VULNERABLE: Approves via infinite allowance without user confirmation
    function depositToken(address token, uint256 amount) external {
        IERC20Minimal(token).transferFrom(msg.sender, address(this), amount);
        deposits[msg.sender] += amount;
    }

    // VULNERABLE: Anyone can call withdrawFrom on behalf of others
    // No check that msg.sender is the depositor
    function withdrawToken(address token, address to, uint256 amount) external onlyOwner {
        IERC20Minimal(token).transfer(to, amount);
        deposits[to] -= amount;
    }

    // VULNERABLE: No limit per user, no revoke mechanism
    function withdrawAll(address token, address to) external onlyOwner {
        uint256 balance = IERC20Minimal(token).balanceOf(address(this));
        IERC20Minimal(token).transfer(to, balance);
        deposits[to] = 0;
    }

    function getDeposits(address user) external view returns (uint256) {
        return deposits[user];
    }
}
