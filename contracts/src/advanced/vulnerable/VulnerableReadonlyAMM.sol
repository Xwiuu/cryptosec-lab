// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// ReentrancyGuard implementation to keep it self-contained
abstract contract ReentrancyGuard {
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;
    uint256 private _status;

    constructor() {
        _status = _NOT_ENTERED;
    }

    modifier nonReentrant() {
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }
}

// VULNERABLE: Read-only Reentrancy AMM
// The pool updates its internal reserves AFTER sending the tokens. 
// Writing operations are protected by nonReentrant, but read-only functions are not.
contract VulnerableReadonlyAMM is ReentrancyGuard {
    uint256 public reserveETH;
    uint256 public reserveToken;
    
    event LiquidityRemoved(address indexed provider, uint256 ethAmount, uint256 tokenAmount);

    constructor() payable {
        reserveETH = msg.value;
        // Mock reserve token ratio 1:1
        reserveToken = msg.value;
    }

    // Returns the asset price in tokens per ETH based on current spot balance
    function getPrice() public view returns (uint256) {
        uint256 ethBalance = address(this).balance;
        if (ethBalance == 0) return 0;
        return (reserveToken * 1e18) / ethBalance;
    }

    // VULNERABLE: Sends ETH BEFORE updating reserveETH, and is reentrant-protected.
    // However, external viewers calling getPrice() during the callback will see a manipulated price.
    function removeLiquidity(uint256 ethAmount, uint256 tokenAmount) external nonReentrant {
        require(reserveETH >= ethAmount && reserveToken >= tokenAmount, "Not enough reserves");
        
        // 1. Send ETH to provider. This triggers receiver's fallback/receive.
        (bool success, ) = msg.sender.call{value: ethAmount}("");
        require(success, "ETH transfer failed");

        // 2. Update reserves (Effects)
        reserveETH -= ethAmount;
        reserveToken -= tokenAmount;

        emit LiquidityRemoved(msg.sender, ethAmount, tokenAmount);
    }
}

// VULNERABLE: Lending pool that uses the AMM as an oracle.
// Vulnerable to Read-only Reentrancy because it queries AMM.getPrice() which can return a manipulated value.
contract VulnerableLendingWithOracle {
    VulnerableReadonlyAMM public amm;
    mapping(address => uint256) public deposits;
    mapping(address => uint256) public borrowed;

    constructor(address _amm) {
        amm = VulnerableReadonlyAMM(_amm);
    }

    function deposit() external payable {
        deposits[msg.sender] += msg.value;
    }

    // Borrow tokens using deposited ETH as collateral
    function borrow(uint256 tokenAmount) external {
        uint256 collateralETH = deposits[msg.sender];
        require(collateralETH > 0, "No collateral");

        // Query price from AMM
        uint256 price = amm.getPrice(); // 1 ETH = X tokens
        
        // Calculate max borrow capacity (allow 80% LTV)
        uint256 maxBorrow = (collateralETH * price * 80) / (100 * 1e18);
        require(borrowed[msg.sender] + tokenAmount <= maxBorrow, "Insufficient collateral");

        borrowed[msg.sender] += tokenAmount;
        // In a real protocol, we would transfer the borrowed tokens. We mock it here.
    }
}
