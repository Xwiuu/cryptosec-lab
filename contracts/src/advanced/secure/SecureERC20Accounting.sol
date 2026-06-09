// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../../interfaces/IERC20Minimal.sol";

// SECURE: Uses balance checks to calculate actual deposits and requires successful transfer return values.
contract SecureERC20Accounting {
    IERC20Minimal public token;
    mapping(address => uint256) public deposits;
    uint256 public totalDeposits;

    constructor(address _token) {
        token = IERC20Minimal(_token);
    }

    // SECURE: Calculates deposit amount by checking balance changes
    function deposit(uint256 amount) external {
        uint256 balanceBefore = token.balanceOf(address(this));
        
        // SECURE: Check return value
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        uint256 balanceAfter = token.balanceOf(address(this));
        uint256 actualReceived = balanceAfter - balanceBefore; // Accounts for fee-on-transfer tokens

        require(actualReceived > 0, "No tokens received");

        deposits[msg.sender] += actualReceived;
        totalDeposits += actualReceived;
    }

    // SECURE: Check return value
    function withdraw(uint256 amount) external {
        require(deposits[msg.sender] >= amount, "Insufficient balance");
        
        deposits[msg.sender] -= amount;
        totalDeposits -= amount;

        // SECURE: Explicitly verify transfer result
        require(token.transfer(msg.sender, amount), "Transfer failed");
    }
}
