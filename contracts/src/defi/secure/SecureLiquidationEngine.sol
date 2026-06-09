// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../../interfaces/IERC20Minimal.sol";
import "../../interfaces/IPriceOracle.sol";

interface ILendingPool {
    function getUserInfo(address user) external view returns (uint256 collateral, uint256 debt);
    function getHealthFactor(address user) external view returns (uint256);
}

contract SecureLiquidationEngine {
    ILendingPool public immutable lendingPool;
    IPriceOracle public immutable oracle;

    address public owner;

    uint256 public constant MIN_HEALTH_FACTOR = 1e18;
    uint256 public constant CLOSE_FACTOR = 5000;
    uint256 public constant LIQUIDATION_BONUS = 500;
    uint256 public constant PRECISION = 1e18;
    uint256 public constant ORACLE_MAX_AGE = 1 hours;

    event LiquidationExecuted(
        address indexed liquidator,
        address indexed user,
        uint256 debtCovered,
        uint256 collateralSeized,
        address collateralToken,
        address debtToken
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _lendingPool, address _oracle) {
        require(_lendingPool != address(0), "Zero lending pool");
        require(_oracle != address(0), "Zero oracle");
        lendingPool = ILendingPool(_lendingPool);
        oracle = IPriceOracle(_oracle);
        owner = msg.sender;
    }

    function liquidate(
        address user,
        uint256 debtToCover,
        address collateralToken,
        address debtToken
    ) external {
        require(user != address(0), "Zero user");
        require(user != msg.sender, "Cannot self-liquidate");
        require(debtToCover > 0, "Debt to cover must be > 0");
        require(collateralToken != address(0), "Zero collateral");
        require(debtToken != address(0), "Zero debt");

        uint256 healthFactor = lendingPool.getHealthFactor(user);
        require(healthFactor < MIN_HEALTH_FACTOR, "Position not liquidatable");

        (uint256 userCollateral, uint256 userDebt) = lendingPool.getUserInfo(user);
        require(userDebt > 0, "User has no debt");

        uint256 price = _getPrice();

        uint256 maxDebtToCover = (userDebt * CLOSE_FACTOR) / 10_000;
        uint256 actualDebtToCover = debtToCover > maxDebtToCover ? maxDebtToCover : debtToCover;
        if (actualDebtToCover > userDebt) {
            actualDebtToCover = userDebt;
        }

        uint256 collateralValue = (userCollateral * price) / PRECISION;
        uint256 collateralToSeize =
            (actualDebtToCover * PRECISION * (10_000 + LIQUIDATION_BONUS)) / (price * 10_000);

        if (collateralToSeize > userCollateral) {
            collateralToSeize = userCollateral;
        }

        require(collateralToSeize > 0, "Nothing to seize");

        IERC20Minimal(debtToken).transferFrom(msg.sender, address(this), actualDebtToCover);
        IERC20Minimal(debtToken).transfer(address(lendingPool), actualDebtToCover);
        IERC20Minimal(collateralToken).transfer(msg.sender, collateralToSeize);

        emit LiquidationExecuted(
            msg.sender, user, actualDebtToCover, collateralToSeize, collateralToken, debtToken
        );
    }

    function getHealthFactor(address user) public view returns (uint256) {
        return lendingPool.getHealthFactor(user);
    }

    function _getPrice() internal view returns (uint256) {
        uint256 price = oracle.getPrice();
        return price;
    }

    function getLiquidationAmounts(address user, uint256 debtToCover)
        external
        view
        returns (uint256 maxDebtToCover, uint256 collateralToSeize)
    {
        (uint256 userCollateral, uint256 userDebt) = lendingPool.getUserInfo(user);
        if (userDebt == 0) return (0, 0);
        uint256 price = _getPrice();
        maxDebtToCover = (userDebt * CLOSE_FACTOR) / 10_000;
        if (debtToCover > maxDebtToCover) debtToCover = maxDebtToCover;
        if (debtToCover > userDebt) debtToCover = userDebt;
        collateralToSeize =
            (debtToCover * PRECISION * (10_000 + LIQUIDATION_BONUS)) / (price * 10_000);
        if (collateralToSeize > userCollateral) collateralToSeize = userCollateral;
    }
}
