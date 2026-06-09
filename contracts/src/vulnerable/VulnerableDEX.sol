// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IERC20Minimal.sol";

// VULNERABLE: Simple AMM x*y=k with manipulable price
// No slippage protection, no TWAP, single-sided liquidity risk
contract VulnerableDEX {
    IERC20Minimal public token0;
    IERC20Minimal public token1;
    uint256 public reserve0;
    uint256 public reserve1;

    constructor(address _token0, address _token1) {
        token0 = IERC20Minimal(_token0);
        token1 = IERC20Minimal(_token1);
    }

    // VULNERABLE: No minimum liquidity, no total supply tracking
    function addLiquidity(uint256 amount0, uint256 amount1) external {
        require(amount0 > 0 && amount1 > 0, "Amounts must be > 0");
        token0.transferFrom(msg.sender, address(this), amount0);
        token1.transferFrom(msg.sender, address(this), amount1);
        reserve0 += amount0;
        reserve1 += amount1;
    }

    // VULNERABLE: No slippage protection - price can be manipulated
    function swap(address tokenIn, uint256 amountIn) external returns (uint256) {
        require(amountIn > 0, "Amount must be > 0");
        (IERC20Minimal inToken, IERC20Minimal outToken, uint256 inReserve, uint256 outReserve) = tokenIn
            == address(token0)
            ? (token0, token1, reserve0, reserve1)
            : (token1, token0, reserve1, reserve0);

        // x * y = k, so amountOut = outReserve - (inReserve * outReserve / (inReserve + amountIn))
        uint256 amountOut = outReserve - (inReserve * outReserve) / (inReserve + amountIn);

        inToken.transferFrom(msg.sender, address(this), amountIn);
        outToken.transfer(msg.sender, amountOut);

        reserve0 = token0.balanceOf(address(this));
        reserve1 = token1.balanceOf(address(this));
        return amountOut;
    }

    // VULNERABLE: No slippage protection for removal
    function removeLiquidity(uint256 amount0, uint256 amount1) external {
        require(amount0 > 0 && amount1 > 0, "Amounts must be > 0");
        reserve0 -= amount0;
        reserve1 -= amount1;
        token0.transfer(msg.sender, amount0);
        token1.transfer(msg.sender, amount1);
    }
}
