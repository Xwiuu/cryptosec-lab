// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../../interfaces/IERC20Minimal.sol";

// VULNERABLE: intentionally insecure for educational purposes.
contract VulnerableLiquidationEngine {
    address public lendingPool;
    address public oracle;

    uint256 public constant BONUS_BPS = 1200;
    uint256 public constant CLOSE_FACTOR_BPS = 10_000;

    mapping(address => bool) public isLiquidated;

    constructor(address _lendingPool, address _oracle) {
        lendingPool = _lendingPool;
        oracle = _oracle;
    }

    function liquidate(address user, uint256 debtToCover) external {
        require(!isLiquidated[user], "Already liquidated");
        require(getHealthFactor(user) < 2 * 1e18, "Position appears healthy");

        (uint256 userCollateral, uint256 userDebt) = _getUserPosition(user);
        (address borrowTokenAddr, address collateralTokenAddr) = _getPoolTokens();

        uint256 actualDebtToCover = (debtToCover * CLOSE_FACTOR_BPS) / 10_000;
        if (actualDebtToCover > userDebt) {
            actualDebtToCover = userDebt;
        }

        uint256 seizeAmount = (actualDebtToCover * (10_000 + BONUS_BPS)) / 10_000;
        if (seizeAmount > userCollateral) {
            seizeAmount = userCollateral;
        }

        IERC20Minimal borrowToken = IERC20Minimal(borrowTokenAddr);
        borrowToken.transferFrom(msg.sender, address(this), actualDebtToCover);
        borrowToken.approve(lendingPool, actualDebtToCover);

        (bool okRepay,) = lendingPool.call(
            abi.encodeWithSignature("repayOnBehalf(address,uint256)", user, actualDebtToCover)
        );
        require(okRepay, "Repay failed");

        (bool okSeize,) = lendingPool.call(
            abi.encodeWithSignature("seizeCollateral(address,uint256)", user, seizeAmount)
        );
        require(okSeize, "Seize failed");

        IERC20Minimal(collateralTokenAddr).transfer(msg.sender, seizeAmount);
        isLiquidated[user] = true;
    }

    function getHealthFactor(address user) public view returns (uint256) {
        (bool successColl, bytes memory collData) =
            lendingPool.staticcall(abi.encodeWithSignature("collateralOf(address)", user));
        (bool successDebt, bytes memory debtData) =
            lendingPool.staticcall(abi.encodeWithSignature("debtOf(address)", user));
        if (!successColl || !successDebt) return 0;

        uint256 collateral = abi.decode(collData, (uint256));
        uint256 debt = abi.decode(debtData, (uint256));
        if (debt == 0) return type(uint256).max;

        (bool successPrice, bytes memory priceData) =
            oracle.staticcall(abi.encodeWithSignature("getPrice()"));
        require(successPrice, "Oracle call failed");
        uint256 price = abi.decode(priceData, (uint256));

        return (collateral * price) / debt;
    }

    function _getUserPosition(address user)
        internal
        view
        returns (uint256 collateral, uint256 debt)
    {
        (bool ok1, bytes memory d1) = lendingPool.staticcall(
            abi.encodeWithSignature("collateralOf(address)", user)
        );
        (bool ok2, bytes memory d2) =
            lendingPool.staticcall(abi.encodeWithSignature("debtOf(address)", user));
        require(ok1 && ok2, "Pool read failed");
        return (abi.decode(d1, (uint256)), abi.decode(d2, (uint256)));
    }

    function _getPoolTokens() internal view returns (address borrowToken, address collateralToken) {
        (bool ok1, bytes memory d1) =
            lendingPool.staticcall(abi.encodeWithSignature("borrowToken()"));
        (bool ok2, bytes memory d2) =
            lendingPool.staticcall(abi.encodeWithSignature("collateralToken()"));
        require(ok1 && ok2, "Pool read failed");
        return (abi.decode(d1, (address)), abi.decode(d2, (address)));
    }
}
