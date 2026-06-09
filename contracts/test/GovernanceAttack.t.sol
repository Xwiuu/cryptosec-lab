// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/vulnerable/VulnerableDAO.sol";
import "../src/secure/SecureDAO.sol";
import "../src/attacks/GovernanceAttacker.sol";

contract GovernanceAttackTest is Test {
    VulnerableDAO public vulnDAO;
    SecureDAO public secureDAO;
    GovernanceAttacker public attacker;
    address public attackerAddr = address(0x1337);

    function setUp() external {
        vulnDAO = new VulnerableDAO();
        secureDAO = new SecureDAO();
        attacker = new GovernanceAttacker();
    }

    function testVulnerableDAOAllowsFlashLoanGovernance() external {
        vm.prank(attackerAddr);
        vulnDAO.delegateVotes(attackerAddr);

        assertEq(vulnDAO.votes(attackerAddr), 100);
    }

    function testVulnerableDAOAllowsLowQuorumProposal() external {
        vm.prank(attackerAddr);
        vulnDAO.delegateVotes(attackerAddr);

        uint256 propId = vulnDAO.createProposal(
            address(attacker),
            abi.encodeWithSignature(
                "drainTreasury(address,address)", address(vulnDAO), attackerAddr
            )
        );

        vm.prank(attackerAddr);
        vulnDAO.vote(propId, true);

        vm.warp(block.timestamp + 8 days);

        // Execute - quorum is 1, so single vote passes
        vulnDAO.executeProposal(propId);
        assertTrue(attacker.executed());
    }

    function testVulnerableDAORejectsInvalidProposalId() external {
        vm.expectRevert();
        vulnDAO.vote(999, true);
    }

    // SECURE TESTS
    function testSecureDAORequiresTimelockAndSnapshot() external {
        secureDAO.setVotingPower(attackerAddr, 100);

        vm.prank(attackerAddr);
        uint256 propId = secureDAO.createProposal(
            address(attacker),
            abi.encodeWithSignature(
                "drainTreasury(address,address)", address(secureDAO), attackerAddr
            ),
            "malicious"
        );

        vm.prank(attackerAddr);
        secureDAO.vote(propId, true);

        vm.warp(block.timestamp + 8 days);

        // Timelock hasn't elapsed (2 days after voting ends = 9 days total)
        vm.expectRevert();
        secureDAO.executeProposal(propId);
    }

    function testSecureDAORejectsLowQuorumProposal() external {
        secureDAO.setVotingPower(attackerAddr, 50);

        vm.prank(attackerAddr);
        uint256 propId =
            secureDAO.createProposal(address(1), abi.encodeWithSignature("whatever()"), "test");

        vm.prank(attackerAddr);
        secureDAO.vote(propId, true);

        vm.warp(block.timestamp + 8 days + 2 days + 1);

        vm.expectRevert();
        secureDAO.executeProposal(propId);
    }

    function testSecureDAORejectsUnauthorizedProposal() external {
        vm.prank(attackerAddr);
        vm.expectRevert();
        secureDAO.createProposal(address(1), "", "test");
    }
}
