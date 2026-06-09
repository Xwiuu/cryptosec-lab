// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../../interfaces/IERC20Minimal.sol";

// VULNERABLE: intentionally insecure for educational purposes.
contract VulnerableAMM {
    IERC20Minimal public token0;
    IERC20Minimal public token1;

    mapping(address => uint256) public deposited0;
    mapping(address => uint256) public deposited1;

    constructor(address _token0, address _token1) {
        token0 = IERC20Minimal(_token0);
        token1 = IERC20Minimal(_token1);
    }

    function getReserve0() public view returns (uint256) {
        return token0.balanceOf(address(this));
    }

    function getReserve1() public view returns (uint256) {
        return token1.balanceOf(address(this));
    }

    function addLiquidity(uint256 amount0, uint256 amount1) external {
        token0.transferFrom(msg.sender, address(this), amount0);
        token1.transferFrom(msg.sender, address(this), amount1);
        deposited0[msg.sender] += amount0;
        deposited1[msg.sender] += amount1;
    }

    function removeLiquidity(uint256 amount0, uint256 amount1) external {
        require(deposited0[msg.sender] >= amount0, "Insufficient share token0");
        require(deposited1[msg.sender] >= amount1, "Insufficient share token1");
        deposited0[msg.sender] -= amount0;
        deposited1[msg.sender] -= amount1;
        token0.transfer(msg.sender, amount0);
        token1.transfer(msg.sender, amount1);
    }

    function swap(address tokenIn, uint256 amountIn) external returns (uint256 amountOut) {
        require(tokenIn == address(token0) || tokenIn == address(token1), "Invalid token");
        amountOut = getAmountOut(tokenIn, amountIn);
        if (tokenIn == address(token0)) {
            token0.transferFrom(msg.sender, address(this), amountIn);
            token1.transfer(msg.sender, amountOut);
        } else {
            token1.transferFrom(msg.sender, address(this), amountIn);
            token0.transfer(msg.sender, amountOut);
        }
    }

    function getAmountOut(address tokenIn, uint256 amountIn) public view returns (uint256) {
        uint256 reserveIn;
        uint256 reserveOut;
        if (tokenIn == address(token0)) {
            reserveIn = getReserve0();
            reserveOut = getReserve1();
        } else {
            reserveIn = getReserve1();
            reserveOut = getReserve0();
        }
        uint256 numerator = amountIn * reserveOut;
        uint256 denominator = reserveIn + amountIn;
        return numerator / denominator;
    }

    function getPrice() external view returns (uint256) {
        return getReserve1() / getReserve0();
    }
}
