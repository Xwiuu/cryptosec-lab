// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../../interfaces/IERC20Minimal.sol";

// VULNERABLE: intentionally insecure for educational purposes.
contract VulnerableLendingPool {
    IERC20Minimal public collateralToken;
    IERC20Minimal public borrowToken;
    address public priceOracle;

    uint256 public constant LTV_PRECISION = 110;

    mapping(address => uint256) public collateralOf;
    mapping(address => uint256) public debtOf;

    constructor(address _collateralToken, address _borrowToken, address _priceOracle) {
        collateralToken = IERC20Minimal(_collateralToken);
        borrowToken = IERC20Minimal(_borrowToken);
        priceOracle = _priceOracle;
    }

    function depositCollateral(uint256 amount) external {
        collateralToken.transferFrom(msg.sender, address(this), amount);
        collateralOf[msg.sender] += amount;
    }

    function borrow(uint256 amount) external {
        uint256 price = _getPrice();
        uint256 maxBorrow = (collateralOf[msg.sender] * price * LTV_PRECISION) / (1e18 * 100);
        require(amount <= maxBorrow, "Borrow exceeds max");
        debtOf[msg.sender] += amount;
        borrowToken.transfer(msg.sender, amount);
    }

    function repay(uint256 amount) external {
        require(debtOf[msg.sender] >= amount, "Repay exceeds debt");
        borrowToken.transferFrom(msg.sender, address(this), amount);
        debtOf[msg.sender] -= amount;
    }

    function repayOnBehalf(address user, uint256 amount) external {
        borrowToken.transferFrom(msg.sender, address(this), amount);
        debtOf[user] -= amount;
    }

    function seizeCollateral(address user, uint256 amount) external {
        require(collateralOf[user] >= amount, "Not enough collateral");
        collateralOf[user] -= amount;
        collateralToken.transfer(msg.sender, amount);
    }

    function withdrawCollateral(uint256 amount) external {
        require(collateralOf[msg.sender] >= amount, "Collateral too low");
        collateralOf[msg.sender] -= amount;
        collateralToken.transfer(msg.sender, amount);
    }

    function getUserInfo(address user) external view returns (uint256 collateral, uint256 debt) {
        return (collateralOf[user], debtOf[user]);
    }

    function getHealthFactor(address user) public view returns (uint256) {
        if (debtOf[user] == 0) return type(uint256).max;
        uint256 price = _getPrice();
        return (collateralOf[user] * price * 100) / (debtOf[user] * 80);
    }

    function _getPrice() internal view returns (uint256) {
        (bool success, bytes memory data) =
            priceOracle.staticcall(abi.encodeWithSignature("getPrice()"));
        require(success, "Oracle call failed");
        return abi.decode(data, (uint256));
    }
}
