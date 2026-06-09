// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../../interfaces/IERC20Minimal.sol";
import "../../interfaces/IDexMinimal.sol";

contract LiquidityRugPullAttacker {
    address public owner;
    uint256 private initialLiquidity0;
    uint256 private initialLiquidity1;
    uint256 private profits;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function addLiquidityAndPromote(
        address amm,
        address token0,
        address token1,
        uint256 amount0,
        uint256 amount1
    ) external onlyOwner {
        IERC20Minimal(token0).transferFrom(msg.sender, address(this), amount0);
        IERC20Minimal(token1).transferFrom(msg.sender, address(this), amount1);
        IERC20Minimal(token0).approve(amm, amount0);
        IERC20Minimal(token1).approve(amm, amount1);
        IDexMinimal(amm).addLiquidity(amount0, amount1);
        initialLiquidity0 += amount0;
        initialLiquidity1 += amount1;
    }

    function simulateUsersBuy(address amm, address token0, uint256 amount) external onlyOwner {
        IERC20Minimal(token0).transferFrom(msg.sender, address(this), amount);
        IERC20Minimal(token0).approve(amm, amount);
        IDexMinimal(amm).swap(token0, amount);
    }

    function rugPull(address amm) external onlyOwner {
        IDexMinimal dex = IDexMinimal(amm);
        dex.removeLiquidity(initialLiquidity0, initialLiquidity1);
        profits = initialLiquidity0 + initialLiquidity1;
    }

    function getProfits() external view returns (uint256) {
        return profits;
    }

    function withdrawToken(address token, uint256 amount) external onlyOwner {
        IERC20Minimal(token).transfer(owner, amount);
    }
}
