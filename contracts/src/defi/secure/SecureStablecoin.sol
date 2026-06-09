// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../../interfaces/IERC20Minimal.sol";
import "../../interfaces/IPriceOracle.sol";

contract SecureStablecoin {
    IERC20Minimal public immutable collateralToken;
    IPriceOracle public immutable oracle;

    address public owner;
    bool public paused;

    string public name = "SecureStablecoin";
    string public symbol = "SSC";
    uint8 public decimals = 18;

    uint256 public totalSupply;
    uint256 public totalCollateral;
    uint256 public lastPrice;
    uint256 public lastUpdateBlock;

    uint256 public constant MAX_SUPPLY = 1_000_000 ether;
    uint256 public constant MIN_COLLATERAL_RATIO = 150;
    uint256 public constant PRECISION = 1e18;
    uint256 public constant CIRCUIT_BREAKER_THRESHOLD = 20;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Mint(address indexed user, uint256 amount);
    event Redeem(address indexed user, uint256 amount);
    event CircuitBreakerTriggered(uint256 oldPrice, uint256 newPrice);
    event Paused(address indexed account);
    event Unpaused(address indexed account);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Paused");
        _;
    }

    constructor(address _collateralToken, address _oracle) {
        require(_collateralToken != address(0), "Zero collateral");
        require(_oracle != address(0), "Zero oracle");
        collateralToken = IERC20Minimal(_collateralToken);
        oracle = IPriceOracle(_oracle);
        owner = msg.sender;
        lastPrice = oracle.getPrice();
        lastUpdateBlock = block.number;
    }

    function depositCollateral(uint256 amount) external whenNotPaused {
        require(amount > 0, "Amount must be > 0");
        collateralToken.transferFrom(msg.sender, address(this), amount);
        totalCollateral += amount;
    }

    function mint(uint256 amount) external whenNotPaused {
        require(amount > 0, "Amount must be > 0");
        require(totalSupply + amount <= MAX_SUPPLY, "Supply cap exceeded");
        _checkCircuitBreaker();
        uint256 price = oracle.getPrice();
        uint256 collateralValue = (totalCollateral * price) / PRECISION;
        uint256 newSupply = totalSupply + amount;
        require(
            (collateralValue * 100) / newSupply >= MIN_COLLATERAL_RATIO,
            "Insufficient collateral ratio"
        );
        totalSupply = newSupply;
        balanceOf[msg.sender] += amount;
        emit Mint(msg.sender, amount);
    }

    function redeem(uint256 amount) external whenNotPaused {
        require(amount > 0, "Amount must be > 0");
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        uint256 price = oracle.getPrice();
        uint256 collateralToReturn = (amount * PRECISION) / price;
        require(collateralToReturn <= totalCollateral, "Insufficient collateral");
        balanceOf[msg.sender] -= amount;
        totalSupply -= amount;
        totalCollateral -= collateralToReturn;
        collateralToken.transfer(msg.sender, collateralToReturn);
        emit Redeem(msg.sender, amount);
    }

    function _checkCircuitBreaker() internal {
        uint256 currentPrice = oracle.getPrice();
        if (block.number > lastUpdateBlock && lastPrice > 0) {
            uint256 decline =
                (lastPrice > currentPrice) ? ((lastPrice - currentPrice) * 100) / lastPrice : 0;
            if (decline > CIRCUIT_BREAKER_THRESHOLD) {
                paused = true;
                emit CircuitBreakerTriggered(lastPrice, currentPrice);
                revert("Circuit breaker triggered");
            }
        }
        lastPrice = currentPrice;
        lastUpdateBlock = block.number;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(allowance[from][msg.sender] >= amount, "Allowance exceeded");
        allowance[from][msg.sender] -= amount;
        _transfer(from, to, amount);
        return true;
    }

    function _transfer(address from, address to, uint256 amount) internal {
        require(from != address(0), "Transfer from zero");
        require(to != address(0), "Transfer to zero");
        require(balanceOf[from] >= amount, "Insufficient balance");
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
    }

    function pause() external onlyOwner {
        paused = true;
        emit Paused(msg.sender);
    }

    function unpause() external onlyOwner {
        paused = false;
        emit Unpaused(msg.sender);
    }

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}
