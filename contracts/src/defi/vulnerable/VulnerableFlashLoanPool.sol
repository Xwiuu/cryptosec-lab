// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../../interfaces/IERC20Minimal.sol";

// VULNERABLE: intentionally insecure for educational purposes.
contract VulnerableFlashLoanPool {
    IERC20Minimal public token;
    mapping(address => uint256) public balanceOf;

    constructor(address _token) {
        token = IERC20Minimal(_token);
    }

    function deposit(uint256 amount) external {
        token.transferFrom(msg.sender, address(this), amount);
        balanceOf[msg.sender] += amount;
    }

    function withdraw(uint256 amount) external {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        token.transfer(msg.sender, amount);
    }

    function flashLoan(uint256 amount, address receiver, bytes calldata data) external {
        uint256 balanceBefore = token.balanceOf(address(this));
        require(balanceBefore >= amount, "Insufficient pool liquidity");

        token.transfer(receiver, amount);

        (bool success,) = receiver.call(data);
        require(success, "FlashLoan callback failed");

        uint256 balanceAfter = token.balanceOf(address(this));
        require(balanceAfter >= balanceBefore, "Flash loan not repaid");
    }
}
