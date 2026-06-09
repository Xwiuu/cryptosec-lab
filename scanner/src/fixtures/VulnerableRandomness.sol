// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VulnerableRandomness {
    address public owner;
    mapping(address => uint256) public wins;

    constructor() {
        owner = msg.sender;
    }

    function _badRandom() internal view returns (uint256) {
        return uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp, block.prevrandao, blockhash(block.number - 1), block.number, msg.sender
                )
            )
        ) % 100;
    }

    function guess(uint256 prediction) external payable returns (bool) {
        require(msg.value == 0.1 ether, "Bet 0.1 ETH");
        uint256 result = _badRandom();
        if (prediction == result) {
            payable(msg.sender).transfer(0.2 ether);
            wins[msg.sender]++;
            return true;
        }
        return false;
    }

    function pickWinner(address[] calldata players) external {
        uint256 winnerIndex = _badRandom() % players.length;
        payable(players[winnerIndex]).transfer(address(this).balance);
    }
}
