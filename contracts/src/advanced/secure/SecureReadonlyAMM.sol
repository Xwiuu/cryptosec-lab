// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../vulnerable/VulnerableReadonlyAMM.sol";

// SECURE: Updates reserves BEFORE transferring assets (Checks-Effects-Interactions).
contract SecureReadonlyAMM is ReentrancyGuard {
    uint256 public reserveETH;
    uint256 public reserveToken;

    event LiquidityRemoved(address indexed provider, uint256 ethAmount, uint256 tokenAmount);

    constructor() payable {
        reserveETH = msg.value;
        reserveToken = msg.value;
    }

    function getPrice() public view returns (uint256) {
        uint256 ethBalance = address(this).balance;
        if (ethBalance == 0) return 0;
        return (reserveToken * 1e18) / ethBalance;
    }

    // SECURE: Updates reserves first, making the read-only view function consistent even during callback execution.
    function removeLiquidity(uint256 ethAmount, uint256 tokenAmount) external nonReentrant {
        require(reserveETH >= ethAmount && reserveToken >= tokenAmount, "Not enough reserves");

        // 1. Update reserves (Effects first)
        reserveETH -= ethAmount;
        reserveToken -= tokenAmount;

        // 2. Send ETH to provider (Interactions last)
        (bool success, ) = msg.sender.call{value: ethAmount}("");
        require(success, "ETH transfer failed");

        emit LiquidityRemoved(msg.sender, ethAmount, tokenAmount);
    }
}

// SECURE: Lending pool with checked oracle price.
contract SecureLendingWithOracle {
    SecureReadonlyAMM public amm;
    mapping(address => uint256) public deposits;
    mapping(address => uint256) public borrowed;

    constructor(address _amm) {
        amm = SecureReadonlyAMM(_amm);
    }

    function deposit() external payable {
        deposits[msg.sender] += msg.value;
    }

    function borrow(uint256 tokenAmount) external {
        uint256 collateralETH = deposits[msg.sender];
        require(collateralETH > 0, "No collateral");

        uint256 price = amm.getPrice();
        uint256 maxBorrow = (collateralETH * price * 80) / (100 * 1e18);
        require(borrowed[msg.sender] + tokenAmount <= maxBorrow, "Insufficient collateral");

        borrowed[msg.sender] += tokenAmount;
    }
}
