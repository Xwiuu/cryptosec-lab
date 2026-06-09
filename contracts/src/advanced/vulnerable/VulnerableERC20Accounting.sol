// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../../interfaces/IERC20Minimal.sol";

// VULNERABLE: Unchecked ERC20 returns and Fee-on-transfer token accounting issues.
contract VulnerableERC20Accounting {
    IERC20Minimal public token;
    mapping(address => uint256) public deposits;
    uint256 public totalDeposits;

    constructor(address _token) {
        token = IERC20Minimal(_token);
    }

    // VULNERABLE: Fee-on-transfer accounting issue.
    // It reads transferAmount from parameters instead of measuring actual balance increase.
    function deposit(uint256 amount) external {
        // VULNERABLE: Does not check return value of transferFrom
        token.transferFrom(msg.sender, address(this), amount);

        // VULNERABLE: Assumes it received exactly 'amount', but if 'token' is a fee-on-transfer token,
        // the actual received balance is less. This causes accounting discrepancies.
        deposits[msg.sender] += amount;
        totalDeposits += amount;
    }

    // VULNERABLE: Unchecked return value of transfer
    function withdraw(uint256 amount) external {
        require(deposits[msg.sender] >= amount, "Insufficient balance");
        
        deposits[msg.sender] -= amount;
        totalDeposits -= amount;

        // VULNERABLE: Does not check return value. 
        // If the token transfer returns false instead of reverting, the user's deposit is cleared
        // without them actually receiving the tokens.
        token.transfer(msg.sender, amount);
    }
}
