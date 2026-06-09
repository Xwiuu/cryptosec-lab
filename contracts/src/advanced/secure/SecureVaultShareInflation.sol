// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../../interfaces/IERC20Minimal.sol";

// SECURE: Implements virtual shares (offset method) to protect against first depositor inflation attacks.
contract SecureVaultShareInflation {
    IERC20Minimal public asset;
    uint256 public totalShares;
    mapping(address => uint256) public balanceOf;

    // Virtual offset parameters
    uint256 private constant OFFSET = 1000;

    constructor(address _asset) {
        asset = IERC20Minimal(_asset);
    }

    function totalAssets() public view returns (uint256) {
        return asset.balanceOf(address(this));
    }

    // SECURE: Uses virtual shares of 1000 with a virtual offset of 1 wei of assets.
    // shares = (amount * (totalShares + OFFSET)) / (totalAssets() + 1).
    // This prevents division rounding to 0.
    function deposit(uint256 amount) external returns (uint256 shares) {
        shares = (amount * (totalShares + OFFSET)) / (totalAssets() + 1);
        require(shares > 0, "Zero shares minted");

        require(asset.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        balanceOf[msg.sender] += shares;
        totalShares += shares;
    }

    function withdraw(uint256 shares) external returns (uint256 amount) {
        require(balanceOf[msg.sender] >= shares, "Insufficient shares");
        
        amount = (shares * (totalAssets() + 1)) / (totalShares + OFFSET);
        
        balanceOf[msg.sender] -= shares;
        totalShares -= shares;

        require(asset.transfer(msg.sender, amount), "Transfer failed");
    }
}
