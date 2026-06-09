// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// VULNERABLE: Single source oracle - price can be manipulated
contract VulnerableOracle {
    uint256 public price;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    // VULNERABLE: Single point of control, no validation
    function setPrice(uint256 newPrice) external {
        require(msg.sender == owner, "Not owner");
        price = newPrice;
    }

    // VULNERABLE: No stale price check, no multiple sources
    function getPrice() external view returns (uint256) {
        return price;
    }
}
