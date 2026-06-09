// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../../interfaces/IERC20Minimal.sol";

// VULNERABLE: Vault Share Inflation / First Depositor Attack (ERC4626 style vulnerability)
contract VulnerableVaultShareInflation {
    IERC20Minimal public asset;
    uint256 public totalShares;
    mapping(address => uint256) public balanceOf;

    constructor(address _asset) {
        asset = IERC20Minimal(_asset);
    }

    function totalAssets() public view returns (uint256) {
        return asset.balanceOf(address(this));
    }

    // VULNERABLE: Standard share inflation formula.
    // If totalShares is 0, shares = asset amount.
    // Otherwise, shares = (amount * totalShares) / totalAssets().
    // Division rounding can cause subsequent depositors to get 0 shares if asset.balanceOf is artificially inflated.
    function deposit(uint256 amount) external returns (uint256 shares) {
        if (totalShares == 0) {
            shares = amount;
        } else {
            shares = (amount * totalShares) / totalAssets();
        }

        require(shares > 0, "Zero shares minted");

        require(asset.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        balanceOf[msg.sender] += shares;
        totalShares += shares;
    }

    function withdraw(uint256 shares) external returns (uint256 amount) {
        require(balanceOf[msg.sender] >= shares, "Insufficient shares");
        
        amount = (shares * totalAssets()) / totalShares;
        
        balanceOf[msg.sender] -= shares;
        totalShares -= shares;

        require(asset.transfer(msg.sender, amount), "Transfer failed");
    }
}
