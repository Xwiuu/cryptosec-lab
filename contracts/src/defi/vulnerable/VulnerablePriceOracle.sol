// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// VULNERABLE: intentionally insecure for educational purposes.
contract VulnerablePriceOracle {
    uint256 public price;

    constructor(uint256 _initialPrice) {
        price = _initialPrice;
    }

    function getPrice() external view returns (uint256) {
        return price;
    }

    function setPrice(uint256 _price) external {
        price = _price;
    }
}
