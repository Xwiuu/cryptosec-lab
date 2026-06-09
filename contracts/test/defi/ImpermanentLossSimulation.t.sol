// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";

contract SimpleAMM {
    uint256 public reserve0;
    uint256 public reserve1;
    uint256 public constant FEE_NUM = 997;
    uint256 public constant FEE_DEN = 1000;

    constructor(uint256 r0, uint256 r1) {
        reserve0 = r0;
        reserve1 = r1;
    }

    function swap(uint256 amountIn, bool isToken0) external returns (uint256 amountOut) {
        if (isToken0) {
            uint256 amountInWithFee = amountIn * FEE_NUM;
            uint256 numerator = amountInWithFee * reserve1;
            uint256 denominator = (reserve0 * FEE_DEN) + amountInWithFee;
            amountOut = numerator / denominator;
            reserve0 += amountIn;
            reserve1 -= amountOut;
        } else {
            uint256 amountInWithFee = amountIn * FEE_NUM;
            uint256 numerator = amountInWithFee * reserve0;
            uint256 denominator = (reserve1 * FEE_DEN) + amountInWithFee;
            amountOut = numerator / denominator;
            reserve1 += amountIn;
            reserve0 -= amountOut;
        }
    }

    function getK() external view returns (uint256) {
        return reserve0 * reserve1;
    }
}

contract ImpermanentLossSimulationTest is Test {
    function testImpermanentLossWhenPriceDoubles() external {
        uint256 x0 = 1000;
        uint256 y0 = 1000;
        uint256 k = x0 * y0;

        uint256 r = 2;

        uint256 x1 = _sqrt(k * 1e18 / r) / 1e9;
        uint256 y1 = k / x1;

        uint256 hodlValue = x0 * r + y0;

        uint256 price = r;
        uint256 lpValue = x1 * price + y1;

        assertLt(lpValue, hodlValue);

        uint256 ilBps = ((hodlValue - lpValue) * 10_000) / hodlValue;
        assertGt(ilBps, 500);
        assertLt(ilBps, 600);
    }

    function testImpermanentLossWhenPriceHalves() external {
        uint256 x0 = 1000;
        uint256 y0 = 1000;
        uint256 k = x0 * y0;

        uint256 rNum = 1;
        uint256 rDen = 2;

        uint256 x1 = _sqrt(k * 1e18 * rDen / rNum) / 1e9;
        uint256 y1 = k / x1;

        uint256 hodlValue = x0 * rNum / rDen + y0;

        uint256 lpValue = x1 * rNum / rDen + y1;

        assertLt(lpValue, hodlValue);

        uint256 ilBps = ((hodlValue - lpValue) * 10_000) / hodlValue;
        assertGt(ilBps, 500);
        assertLt(ilBps, 600);
    }

    function testFeesCanOffsetSomeImpermanentLoss() external {
        uint256 x0 = 1000e18;
        uint256 y0 = 1000e18;

        SimpleAMM amm = new SimpleAMM(x0, y0);

        uint256 totalFees;
        for (uint256 i = 0; i < 100; i++) {
            amm.swap(10e18, true);
            amm.swap(9e18, false);
        }

        uint256 k = amm.getK();
        assertGt(k, x0 * y0);

        assertGt(amm.reserve0() + amm.reserve1(), x0 + y0);
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
}
