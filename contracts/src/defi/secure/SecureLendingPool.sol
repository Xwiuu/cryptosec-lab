// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../../interfaces/IERC20Minimal.sol";
import "../../interfaces/IPriceOracle.sol";

contract SecureLendingPool {
    IERC20Minimal public immutable collateralToken;
    IERC20Minimal public immutable debtToken;
    IPriceOracle public immutable oracle;

    address public owner;

    uint256 public constant MAX_LTV = 7500;
    uint256 public constant LIQUIDATION_THRESHOLD = 8250;
    uint256 public constant HEALTH_FACTOR_PRECISION = 1e18;
    uint256 public constant MIN_HEALTH_FACTOR = 1.5e18;
    uint256 public constant ORACLE_MAX_AGE = 1 hours;

    struct UserInfo {
        uint256 collateral;
        uint256 debt;
    }

    mapping(address => UserInfo) public users;

    event CollateralDeposited(address indexed user, uint256 amount);
    event Borrowed(address indexed user, uint256 amount);
    event Repaid(address indexed user, uint256 amount);
    event CollateralWithdrawn(address indexed user, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _collateralToken, address _debtToken, address _oracle) {
        require(_collateralToken != address(0), "Zero collateral");
        require(_debtToken != address(0), "Zero debt");
        require(_oracle != address(0), "Zero oracle");
        collateralToken = IERC20Minimal(_collateralToken);
        debtToken = IERC20Minimal(_debtToken);
        oracle = IPriceOracle(_oracle);
        owner = msg.sender;
    }

    function depositCollateral(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        collateralToken.transferFrom(msg.sender, address(this), amount);
        users[msg.sender].collateral += amount;
        emit CollateralDeposited(msg.sender, amount);
    }

    function borrow(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        UserInfo storage user = users[msg.sender];
        uint256 maxBorrow = getMaxBorrow(msg.sender);
        require(amount <= maxBorrow, "Exceeds max borrow");
        user.debt += amount;
        debtToken.transfer(msg.sender, amount);
        require(
            getHealthFactor(msg.sender) >= MIN_HEALTH_FACTOR, "Health factor too low after borrow"
        );
        emit Borrowed(msg.sender, amount);
    }

    function repay(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        UserInfo storage user = users[msg.sender];
        require(user.debt >= amount, "Repay exceeds debt");
        debtToken.transferFrom(msg.sender, address(this), amount);
        user.debt -= amount;
        emit Repaid(msg.sender, amount);
    }

    function withdrawCollateral(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        UserInfo storage user = users[msg.sender];
        require(user.collateral >= amount, "Insufficient collateral");
        user.collateral -= amount;
        collateralToken.transfer(msg.sender, amount);
        require(
            getHealthFactor(msg.sender) >= MIN_HEALTH_FACTOR,
            "Health factor too low after withdrawal"
        );
        emit CollateralWithdrawn(msg.sender, amount);
    }

    function getUserInfo(address user) external view returns (uint256 collateral, uint256 debt) {
        return (users[user].collateral, users[user].debt);
    }

    function getPrice() public view returns (uint256) {
        return oracle.getPrice();
    }

    function getHealthFactor(address user) public view returns (uint256) {
        UserInfo storage u = users[user];
        if (u.debt == 0) return type(uint256).max;
        uint256 price = getPrice();
        uint256 collateralValue = (u.collateral * price) / 1e18;
        return (collateralValue * LIQUIDATION_THRESHOLD * HEALTH_FACTOR_PRECISION)
            / (u.debt * 100 * HEALTH_FACTOR_PRECISION) * HEALTH_FACTOR_PRECISION;
    }

    function getMaxBorrow(address user) public view returns (uint256) {
        UserInfo storage u = users[user];
        if (u.collateral == 0) return 0;
        uint256 price = getPrice();
        uint256 collateralValue = (u.collateral * price) / 1e18;
        return (collateralValue * MAX_LTV) / 10_000;
    }
}
