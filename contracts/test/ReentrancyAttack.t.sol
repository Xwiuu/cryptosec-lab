// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/vulnerable/VulnerableBank.sol";
import "../src/secure/SecureBank.sol";
import "../src/attacks/ReentrancyAttacker.sol";

contract ReentrancyAttackTest is Test {
    VulnerableBank public vulnerableBank;
    SecureBank public secureBank;
    ReentrancyAttacker public attacker;

    address public user = address(0x1234);

    function setUp() external {
        vulnerableBank = new VulnerableBank();
        secureBank = new SecureBank();

        // Fund the banks
        vm.deal(address(vulnerableBank), 100 ether);
        vm.deal(address(secureBank), 100 ether);

        attacker = new ReentrancyAttacker();
    }

    function testReentrancyDrainsVulnerableBank() external {
        uint256 attackerInitial = 1 ether;
        uint256 bankInitial = 100 ether;
        vm.deal(address(attacker), attackerInitial);

        attacker.attack{value: attackerInitial}(address(vulnerableBank));

        // Attacker drained more than they deposited (multiple reentrant withdrawals)
        assertGt(address(attacker).balance, attackerInitial);
        // Bank lost ETH to the reentrancy attack
        assertLt(address(vulnerableBank).balance, bankInitial);
    }

    function testSecureBankAllowsNormalWithdrawal() external {
        vm.deal(user, 5 ether);

        vm.prank(user);
        secureBank.deposit{value: 5 ether}();

        assertEq(secureBank.balances(user), 5 ether);

        vm.prank(user);
        secureBank.withdraw(5 ether);

        assertEq(secureBank.balances(user), 0);
    }

    function testSecureBankBlocksReentrancy() external {
        vm.deal(address(attacker), 1 ether);

        vm.expectRevert();
        attacker.attack{value: 1 ether}(address(secureBank));

        // Bank should still have all its ETH
        assertEq(address(secureBank).balance, 100 ether);
    }
}
