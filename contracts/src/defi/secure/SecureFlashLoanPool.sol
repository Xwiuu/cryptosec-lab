// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../../interfaces/IERC20Minimal.sol";

interface IFlashLoanReceiver {
    function executeOperation(address token, uint256 amount, uint256 fee, bytes calldata data)
        external
        returns (bool);
}

contract SecureFlashLoanPool {
    IERC20Minimal public immutable token;
    address public owner;

    uint256 public constant FEE_BASIS_POINTS = 9;
    uint256 public constant BASIS_POINTS = 10_000;
    uint256 public constant TIMELOCK_DELAY = 2 days;

    uint256 public poolBalance;
    mapping(address => uint256) public balanceOf;
    uint256 public withdrawalRequestTimestamp;
    uint256 public withdrawalRequestAmount;
    bool public withdrawalRequested;

    event FlashLoanInitiated(address indexed receiver, uint256 amount, uint256 fee);
    event FlashLoanRepaid(address indexed receiver, uint256 amount, uint256 fee);
    event LiquidityAdded(address indexed provider, uint256 amount);
    event LiquidityWithdrawn(address indexed provider, uint256 amount);
    event WithdrawalRequested(uint256 amount, uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _token) {
        require(_token != address(0), "Zero address");
        token = IERC20Minimal(_token);
        owner = msg.sender;
    }

    function flashLoan(uint256 amount, address receiver, bytes calldata data) external {
        require(amount > 0, "Amount must be > 0");
        require(amount <= poolBalance, "Insufficient pool balance");
        require(receiver != address(0), "Zero receiver");

        uint256 fee = (amount * FEE_BASIS_POINTS) / BASIS_POINTS;
        uint256 balanceBefore = token.balanceOf(address(this));

        token.transfer(receiver, amount);

        emit FlashLoanInitiated(receiver, amount, fee);

        require(
            IFlashLoanReceiver(receiver).executeOperation(address(token), amount, fee, data),
            "Flash loan callback failed"
        );

        uint256 balanceAfter = token.balanceOf(address(this));
        require(balanceAfter >= balanceBefore + fee, "Flash loan not repaid with fee");

        poolBalance = balanceAfter;

        emit FlashLoanRepaid(receiver, amount, fee);
    }

    function addLiquidity(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        token.transferFrom(msg.sender, address(this), amount);
        balanceOf[msg.sender] += amount;
        poolBalance += amount;
        emit LiquidityAdded(msg.sender, amount);
    }

    function requestWithdrawal(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be > 0");
        require(amount <= poolBalance, "Insufficient pool balance");
        withdrawalRequestAmount = amount;
        withdrawalRequestTimestamp = block.timestamp;
        withdrawalRequested = true;
        emit WithdrawalRequested(amount, block.timestamp);
    }

    function withdrawLiquidity(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be > 0");
        require(withdrawalRequested, "No withdrawal requested");
        require(
            block.timestamp >= withdrawalRequestTimestamp + TIMELOCK_DELAY, "Timelock not elapsed"
        );
        require(amount <= withdrawalRequestAmount, "Exceeds requested amount");
        require(amount <= balanceOf[owner], "Insufficient balance");
        balanceOf[owner] -= amount;
        poolBalance -= amount;
        withdrawalRequested = false;
        token.transfer(msg.sender, amount);
        emit LiquidityWithdrawn(msg.sender, amount);
    }
}
