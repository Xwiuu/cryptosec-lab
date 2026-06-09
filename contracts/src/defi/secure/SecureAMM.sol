// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../../interfaces/IERC20Minimal.sol";

contract SecureAMM {
    IERC20Minimal public immutable token0;
    IERC20Minimal public immutable token1;

    uint256 public reserve0;
    uint256 public reserve1;
    uint256 public totalLiquidity;
    mapping(address => uint256) public liquidity;

    uint256 public constant MINIMUM_LIQUIDITY = 10 ** 3;
    uint256 public constant FEE_NUMERATOR = 997;
    uint256 public constant FEE_DENOMINATOR = 1000;

    uint256 public price0CumulativeLast;
    uint256 public price1CumulativeLast;
    uint256 public blockTimestampLast;

    event LiquidityAdded(
        address indexed provider, uint256 amount0, uint256 amount1, uint256 shares
    );
    event LiquidityRemoved(
        address indexed provider, uint256 amount0, uint256 amount1, uint256 shares
    );
    event Swap(
        address indexed sender,
        uint256 amountIn,
        uint256 amountOut,
        address tokenIn,
        address tokenOut
    );

    constructor(address _token0, address _token1) {
        require(_token0 != address(0) && _token1 != address(0), "Zero address");
        require(_token0 != _token1, "Identical tokens");
        token0 = IERC20Minimal(_token0);
        token1 = IERC20Minimal(_token1);
    }

    function addLiquidity(uint256 amount0, uint256 amount1, uint256 minShares)
        external
        returns (uint256 shares)
    {
        require(amount0 > 0 && amount1 > 0, "Amounts must be > 0");

        token0.transferFrom(msg.sender, address(this), amount0);
        token1.transferFrom(msg.sender, address(this), amount1);

        uint256 _totalLiquidity = totalLiquidity;
        if (_totalLiquidity == 0) {
            shares = _sqrt(amount0 * amount1) - MINIMUM_LIQUIDITY;
            _mint(address(0), MINIMUM_LIQUIDITY);
        } else {
            shares = _min(
                (amount0 * _totalLiquidity) / reserve0, (amount1 * _totalLiquidity) / reserve1
            );
        }
        require(shares > 0, "Insufficient shares minted");
        require(shares >= minShares, "Slippage: shares below min");

        _mint(msg.sender, shares);
        _update();

        emit LiquidityAdded(msg.sender, amount0, amount1, shares);
    }

    function removeLiquidity(uint256 shares, uint256 minAmount0, uint256 minAmount1)
        external
        returns (uint256 amount0, uint256 amount1)
    {
        require(shares > 0, "Shares must be > 0");
        require(liquidity[msg.sender] >= shares, "Insufficient LP shares");

        amount0 = (shares * reserve0) / totalLiquidity;
        amount1 = (shares * reserve1) / totalLiquidity;
        require(amount0 >= minAmount0 && amount1 >= minAmount1, "Slippage: amounts below min");
        require(amount0 > 0 && amount1 > 0, "Insufficient liquidity returned");

        _burn(msg.sender, shares);
        _update();

        token0.transfer(msg.sender, amount0);
        token1.transfer(msg.sender, amount1);

        emit LiquidityRemoved(msg.sender, amount0, amount1, shares);
    }

    function swap(address tokenIn, uint256 amountIn, uint256 amountOutMin, uint256 deadline)
        external
        returns (uint256 amountOut)
    {
        require(block.timestamp <= deadline, "Expired deadline");
        require(amountIn > 0, "Amount in must be > 0");
        require(tokenIn == address(token0) || tokenIn == address(token1), "Invalid token");

        (uint256 inReserve, uint256 outReserve) =
            tokenIn == address(token0) ? (reserve0, reserve1) : (reserve1, reserve0);

        uint256 amountInWithFee = amountIn * FEE_NUMERATOR;
        uint256 numerator = amountInWithFee * outReserve;
        uint256 denominator = (inReserve * FEE_DENOMINATOR) + amountInWithFee;
        amountOut = numerator / denominator;

        require(amountOut >= amountOutMin, "Slippage: output below min");
        require(amountOut > 0, "Insufficient output amount");

        IERC20Minimal(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        address tokenOut = tokenIn == address(token0) ? address(token1) : address(token0);
        IERC20Minimal(tokenOut).transfer(msg.sender, amountOut);

        _update();

        emit Swap(msg.sender, amountIn, amountOut, tokenIn, tokenOut);
    }

    function getAmountOut(address tokenIn, uint256 amountIn) external view returns (uint256) {
        require(amountIn > 0, "Amount in must be > 0");
        (uint256 inReserve, uint256 outReserve) =
            tokenIn == address(token0) ? (reserve0, reserve1) : (reserve1, reserve0);
        uint256 amountInWithFee = amountIn * FEE_NUMERATOR;
        uint256 numerator = amountInWithFee * outReserve;
        uint256 denominator = (inReserve * FEE_DENOMINATOR) + amountInWithFee;
        return numerator / denominator;
    }

    function getPrice() external view returns (uint256) {
        require(reserve0 > 0 && reserve1 > 0, "No liquidity");
        return (reserve1 * 1e18) / reserve0;
    }

    function _update() internal {
        (uint256 bal0, uint256 bal1) =
            (token0.balanceOf(address(this)), token1.balanceOf(address(this)));
        uint256 timeElapsed = block.timestamp - blockTimestampLast;
        if (timeElapsed > 0 && reserve0 > 0 && reserve1 > 0) {
            price0CumulativeLast += (reserve1 * 1e18 / reserve0) * timeElapsed;
            price1CumulativeLast += (reserve0 * 1e18 / reserve1) * timeElapsed;
        }
        reserve0 = bal0;
        reserve1 = bal1;
        blockTimestampLast = block.timestamp;
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
