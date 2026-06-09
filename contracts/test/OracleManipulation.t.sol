// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/vulnerable/VulnerableOracle.sol";
import "../src/vulnerable/VulnerableLending.sol";
import "../src/secure/SecureOracle.sol";
import "../src/secure/SecureLending.sol";

contract OracleManipulationTest is Test {
    VulnerableOracle public vulnOracle;
    VulnerableLending public vulnLending;
    SecureOracle public secureOracle;
    SecureLending public secureLending;

    address public attacker = address(0x1337);

    function setUp() external {
        vulnOracle = new VulnerableOracle();
        vulnLending = new VulnerableLending(address(vulnOracle));
        secureOracle = new SecureOracle();
        secureLending = new SecureLending(address(secureOracle));
    }

    function testAttackerManipulatesOracleAndBorrowsTooMuch() external {
        // Attacker deposits 1 ETH as collateral
        vm.deal(attacker, 10 ether);
        vm.prank(attacker);
        vulnLending.deposit{value: 1 ether}();

        // Attacker (who is oracle owner) manipulates price
        // to inflate borrowing power
        vm.prank(vulnOracle.owner());
        vm.assume(vulnOracle.owner() != address(0));
        vulnOracle.setPrice(1_000_000);

        // Borrow way more than collateral should allow
        uint256 maxBorrow = (1 ether * 80) / 100;
        vm.prank(attacker);
        vulnLending.borrow(0.8 ether);
        assertGt(vulnLending.borrows(attacker), 0);
    }

    function testAttackerGainsByOracleManipulation() external {
        vm.deal(attacker, 10 ether);
        vm.prank(attacker);
        vulnLending.deposit{value: 1 ether}();

        vm.prank(vulnOracle.owner());
        vulnOracle.setPrice(1_000_000);

        uint256 attackerBalanceBefore = attacker.balance;
        vm.prank(attacker);
        vulnLending.borrow(0.5 ether);
        assertEq(attacker.balance, attackerBalanceBefore + 0.5 ether);
    }

    function testSecureOracleRejectsUnauthorizedPriceUpdate() external {
        address source = address(0x1);
        vm.prank(source);
        vm.expectRevert();
        secureOracle.submitPrice(100);
    }

    function testSecureOracleRequiresMultipleSources() external {
        address source1 = address(0x1);
        address source2 = address(0x2);
        address source3 = address(0x3);

        secureOracle.addSource(source1);
        secureOracle.addSource(source2);
        secureOracle.addSource(source3);

        vm.prank(source1);
        secureOracle.submitPrice(100);
        vm.prank(source2);
        secureOracle.submitPrice(101);
        vm.prank(source3);
        secureOracle.submitPrice(102);

        assertEq(secureOracle.getPrice(), 101);
    }

    function testSecureLendingRejectsStalePrice() external {
        address source1 = address(0x1);
        address source2 = address(0x2);
        address source3 = address(0x3);

        secureOracle.addSource(source1);
        secureOracle.addSource(source2);
        secureOracle.addSource(source3);

        vm.prank(source1);
        secureOracle.submitPrice(100);
        vm.prank(source2);
        secureOracle.submitPrice(100);
        vm.prank(source3);
        secureOracle.submitPrice(100);

        vm.warp(block.timestamp + 2 hours);

        vm.expectRevert();
        secureOracle.getPrice();
    }
}
