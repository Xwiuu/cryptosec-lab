// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/vulnerable/VulnerableToken.sol";
import "../src/secure/SecureToken.sol";

contract AccessControlAttack is Test {
    VulnerableToken public vulnerable;
    SecureToken public secure;
    address public attacker = address(0x1337);

    function setUp() external {
        vulnerable = new VulnerableToken();
        secure = new SecureToken();
    }

    // VULNERABLE: Anyone can mint
    function testUnauthorizedMintOnVulnerable() external {
        vm.prank(attacker);
        vulnerable.mint(attacker, 1_000_000 ether);
        assertEq(vulnerable.balanceOf(attacker), 1_000_000 ether);
    }

    // SECURE: Only owner can mint
    function testUnauthorizedMintBlockedOnSecure() external {
        vm.prank(attacker);
        vm.expectRevert();
        secure.mint(attacker, 1_000_000 ether);
    }

    function testSecureOwnerCanMint() external {
        secure.mint(attacker, 100 ether);
        assertEq(secure.balanceOf(attacker), 100 ether);
    }
}
