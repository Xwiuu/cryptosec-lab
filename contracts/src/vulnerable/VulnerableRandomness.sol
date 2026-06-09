// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// VULNERABLE: Predictable randomness using block data
// An attacker can predict the outcome and cheat in any gambling game
contract VulnerableRandomness {
    mapping(address => uint256) public wins;

    // VULNERABLE: Uses blockhash and timestamp, both miner-influenced
    function guess(uint256 prediction) external payable returns (bool) {
        require(msg.value > 0, "Bet required");
        uint256 random = _badRandom();
        if (random == prediction) {
            wins[msg.sender]++;
            payable(msg.sender).transfer(msg.value * 2);
            return true;
        }
        return false;
    }

    // VULNERABLE: block.timestamp can be manipulated by miner
    // blockhash only works for recent blocks
    // prevrandao (formerly difficulty) is public
    function _badRandom() internal view returns (uint256) {
        return uint256(
            keccak256(
            abi.encodePacked(
            block.timestamp, block.prevrandao, blockhash(block.number - 1), block.number, msg.sender
        )
        )
        ) % 100;
    }

    // VULNERABLE: No access control on prize distribution
    function claimPrize(address winner) external {
        wins[winner] = 0;
    }

    receive() external payable {}
}
