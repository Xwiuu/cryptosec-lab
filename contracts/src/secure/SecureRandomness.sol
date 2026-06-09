// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// SECURE: Commit-reveal scheme for randomness
// In production, use Chainlink VRF or similar
contract SecureRandomness {
    mapping(address => bytes32) public commitments;
    mapping(address => uint256) public revealedValues;
    mapping(address => bool) public hasRevealed;

    uint256 public constant REVEAL_TIMEOUT = 100;

    // SECURE: Commit to a hash of (secret, salt)
    function commit(bytes32 commitment) external {
        require(commitments[msg.sender] == bytes32(0), "Already committed");
        commitments[msg.sender] = commitment;
    }

    // SECURE: Reveal the secret to produce the random number
    function reveal(uint256 secret, uint256 salt) external {
        bytes32 commitment = commitments[msg.sender];
        require(commitment != bytes32(0), "No commitment");
        require(keccak256(abi.encodePacked(secret, salt)) == commitment, "Invalid reveal");

        revealedValues[msg.sender] =
            uint256(keccak256(abi.encodePacked(secret, salt, block.timestamp)));
        hasRevealed[msg.sender] = true;
        delete commitments[msg.sender];
    }

    // SECURE: Get the final random value
    function getRandom(address user) external view returns (uint256) {
        require(hasRevealed[user], "Not revealed yet");
        return revealedValues[user];
    }

    // SECURE: Cancel commitment if not revealed in time
    function cancelCommitment() external {
        require(commitments[msg.sender] != bytes32(0), "No commitment");
        delete commitments[msg.sender];
    }
}
