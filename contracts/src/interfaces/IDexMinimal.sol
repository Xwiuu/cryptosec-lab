// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IDexMinimal {
    function swap(address tokenIn, uint256 amountIn) external returns (uint256);
    function getAmountOut(address tokenIn, uint256 amountIn) external view returns (uint256);
    function addLiquidity(uint256 amount0, uint256 amount1) external;
    function removeLiquidity(uint256 amount0, uint256 amount1) external;
}
