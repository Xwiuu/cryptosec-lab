// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IERC20Minimal.sol";

// SECURE: AMM with slippage protection, liquidity tracking, safety checks
contract SecureDEX {
    IERC20Minimal public token0;
    IERC20Minimal public token1;
    uint256 public reserve0;
    uint256 public reserve1;
    uint256 public totalLiquidity;
    mapping(address => uint256) public liquidity;

    uint256 public constant MINIMUM_LIQUIDITY = 1000;
    uint256 public constant FEE_NUMERATOR = 997;
    uint256 public constant FEE_DENOMINATOR = 1000;

    constructor(address _token0, address _token1) {
        token0 = IERC20Minimal(_token0);
        token1 = IERC20Minimal(_token1);
    }

    function addLiquidity(uint256 amount0, uint256 amount1) external returns (uint256 shares) {
        token0.transferFrom(msg.sender, address(this), amount0);
        token1.transferFrom(msg.sender, address(this), amount1);

        if (totalLiquidity == 0) {
            shares = _sqrt(amount0 * amount1) - MINIMUM_LIQUIDITY;
            _mint(address(0), MINIMUM_LIQUIDITY);
        } else {
            shares =
                _min((amount0 * totalLiquidity) / reserve0, (amount1 * totalLiquidity) / reserve1);
        }
        require(shares > 0, "Insufficient liquidity minted");
        _mint(msg.sender, shares);
        _update();
    }

    // SECURE: Slippage protection via minAmountOut parameter
    function swap(address tokenIn, uint256 amountIn, uint256 minAmountOut)
        external
        returns (uint256)
    {
        require(amountIn > 0, "Amount must be > 0");

        (uint256 inReserve, uint256 outReserve) =
            tokenIn == address(token0) ? (reserve0, reserve1) : (reserve1, reserve0);

        uint256 amountInWithFee = amountIn * FEE_NUMERATOR;
        uint256 amountOut =
            (amountInWithFee * outReserve) / (inReserve * FEE_DENOMINATOR + amountInWithFee);

        // SECURE: Revert if slippage exceeds user's tolerance
        require(amountOut >= minAmountOut, "Slippage too high");

        IERC20Minimal(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        IERC20Minimal(tokenIn == address(token0) ? address(token1) : address(token0))
            .transfer(msg.sender, amountOut);

        _update();
        return amountOut;
    }

    function removeLiquidity(uint256 shares) external returns (uint256 amount0, uint256 amount1) {
        require(shares > 0, "Shares must be > 0");
        require(liquidity[msg.sender] >= shares, "Insufficient shares");

        amount0 = (shares * reserve0) / totalLiquidity;
        amount1 = (shares * reserve1) / totalLiquidity;
        require(amount0 > 0 && amount1 > 0, "Insufficient liquidity");

        _burn(msg.sender, shares);
        _update();

        token0.transfer(msg.sender, amount0);
        token1.transfer(msg.sender, amount1);
    }

    function _update() internal {
        reserve0 = token0.balanceOf(address(this));
        reserve1 = token1.balanceOf(address(this));
    }

    function _mint(address to, uint256 amount) internal {
        liquidity[to] += amount;
        totalLiquidity += amount;
    }

    function _burn(address from, uint256 amount) internal {
        liquidity[from] -= amount;
        totalLiquidity -= amount;
    }

    function _sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }

    function _min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
}
