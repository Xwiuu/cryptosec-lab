// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/vulnerable/VulnerableRandomness.sol";
import "../src/secure/SecureRandomness.sol";
import "../src/attacks/BadRandomnessAttacker.sol";

contract BadRandomnessTest is Test {
    VulnerableRandomness public vulnGame;
    SecureRandomness public secureRandomness;
    BadRandomnessAttacker public attacker;

    function setUp() external {
        vulnGame = new VulnerableRandomness();
        secureRandomness = new SecureRandomness();
        attacker = new BadRandomnessAttacker();
        vm.deal(address(vulnGame), 10 ether);
    }

    function testBadRandomnessCanBePredicted() external {
        attacker.setTarget(address(vulnGame));
        vm.deal(address(attacker), 1 ether);

        uint256 prediction = attacker.predictRandom();
        attacker.attack{value: 1 ether}();

        assertEq(attacker.predictRandom(), prediction);
    }

    function testBadRandomnessMinerCanInfluence() external {
        address user = address(0x1);
        uint256 r = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    block.prevrandao,
                    blockhash(block.number - 1),
                    block.number,
                    user
                )
            )
        ) % 100;

        vm.roll(block.number + 1);
        vm.warp(block.timestamp + 12);
        uint256 r2 = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    block.prevrandao,
                    blockhash(block.number - 1),
                    block.number,
                    user
                )
            )
        ) % 100;

        assertFalse(r == r2, "Different blocks give different results");
    }

    function testCommitRevealPreventsSimplePrediction() external {
        uint256 secret = 42;
        uint256 salt = 12_345;
        bytes32 commitment = keccak256(abi.encodePacked(secret, salt));

        secureRandomness.commit(commitment);
        assertTrue(secureRandomness.commitments(address(this)) != bytes32(0));

        secureRandomness.reveal(secret, salt);
        assertTrue(secureRandomness.hasRevealed(address(this)));
        assertGt(secureRandomness.getRandom(address(this)), 0);
    }

    function testCommitRevealRejectsInvalidReveal() external {
        uint256 secret = 42;
        uint256 salt = 12_345;
        bytes32 commitment = keccak256(abi.encodePacked(secret, salt));

        secureRandomness.commit(commitment);

        vm.expectRevert();
        secureRandomness.reveal(999, salt);
    }
}
