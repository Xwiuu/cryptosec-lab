// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/vulnerable/VulnerableUpgradeable.sol";
import "../src/secure/SecureUpgradeable.sol";

contract UpgradeabilityRiskTest is Test {
    VulnerableUpgradeable public vulnUpgradeable;
    SecureUpgradeable public secureUpgradeable;

    address public attacker = address(0x1337);

    function setUp() external {
        vulnUpgradeable = new VulnerableUpgradeable();
        secureUpgradeable = new SecureUpgradeable();
    }

    function testAnyoneCanInitializeVulnerable() external {
        address impl = address(new LogicV1());
        vm.prank(attacker);
        vulnUpgradeable.initialize(impl);

        // Attacker becomes admin
        assertEq(vulnUpgradeable.admin(), attacker);
    }

    function testAnyoneCanUpgradeVulnerable() external {
        address impl1 = address(new LogicV1());
        address impl2 = address(new LogicV1());

        vm.prank(attacker);
        vulnUpgradeable.initialize(impl1);
        assertEq(vulnUpgradeable.implementation(), impl1);

        vm.prank(attacker);
        vulnUpgradeable.upgradeTo(impl2);
        assertEq(vulnUpgradeable.implementation(), impl2);
    }

    function testSecureBlocksUnauthorizedInitialize() external {
        address impl = address(new LogicV1());
        vm.prank(attacker);
        vm.expectRevert();
        secureUpgradeable.initialize(impl);
    }

    function testSecureAllowsAuthorizedInitialize() external {
        address impl = address(new LogicV1());
        secureUpgradeable.initialize(impl);
        assertEq(secureUpgradeable.implementation(), impl);
        assertEq(secureUpgradeable.admin(), address(this));
    }

    function testSecureRequiresAdminForUpgrade() external {
        address impl = address(new LogicV1());
        secureUpgradeable.initialize(impl);

        address newImpl = address(new LogicV1());
        vm.prank(attacker);
        vm.expectRevert();
        secureUpgradeable.scheduleUpgrade(newImpl);
    }

    function testSecureUpgradeTimelock() external {
        address impl = address(new LogicV1());
        address newImpl = address(new LogicV1());

        secureUpgradeable.initialize(impl);
        secureUpgradeable.scheduleUpgrade(newImpl);

        // Cannot execute immediately
        vm.expectRevert();
        secureUpgradeable.executeUpgrade();

        // After timelock
        vm.warp(block.timestamp + 2 days + 1);
        secureUpgradeable.executeUpgrade();
        assertEq(secureUpgradeable.implementation(), newImpl);
    }
}
