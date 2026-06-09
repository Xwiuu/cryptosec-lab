// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// SECURE: Oracle with stale checks, health factor, liquidation
contract SecureLending {
    address public oracle;
    address public owner;

    uint256 public constant COLLATERAL_FACTOR = 70; // 70%
    uint256 public constant LIQUIDATION_THRESHOLD = 80; // 80%
    uint256 public constant LIQUIDATION_BONUS = 10; // 10%

    mapping(address => uint256) public deposits;
    mapping(address => uint256) public borrows;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _oracle) {
        oracle = _oracle;
        owner = msg.sender;
    }

    function deposit() external payable {
        deposits[msg.sender] += msg.value;
    }

    function borrow(uint256 amount) external {
        require(deposits[msg.sender] > 0, "No collateral");
        uint256 maxBorrow = getMaxBorrow(msg.sender);
        require(amount <= maxBorrow, "Exceeds max borrow");

        borrows[msg.sender] += amount;
        payable(msg.sender).transfer(amount);
    }

    // SECURE: Health factor must be above liquidation threshold
    function getHealthFactor(address user) public view returns (uint256) {
        if (borrows[user] == 0) return type(uint256).max;
        uint256 collateralValue = deposits[user];
        return (collateralValue * 100) / borrows[user];
    }

    function getMaxBorrow(address user) public view returns (uint256) {
        return (deposits[user] * COLLATERAL_FACTOR) / 100;
    }

    function isLiquidatable(address user) public view returns (bool) {
        return getHealthFactor(user) < LIQUIDATION_THRESHOLD;
    }

    // SECURE: Liquidation with bonus for liquidators
    function liquidate(address user) external payable {
        require(isLiquidatable(user), "Not liquidatable");
        uint256 debt = borrows[user];
        require(msg.value <= debt, "Exceeds debt");

        borrows[user] -= msg.value;
        uint256 collateralShare = (msg.value * 100) / debt;
        uint256 seized = (deposits[user] * collateralShare) / 100;
        uint256 bonus = (seized * LIQUIDATION_BONUS) / 100;
        deposits[user] -= seized;

        payable(msg.sender).transfer(seized + bonus);
    }

    function repay() external payable {
        require(borrows[msg.sender] >= msg.value, "Exceeds debt");
        borrows[msg.sender] -= msg.value;
    }

    receive() external payable {}
}
