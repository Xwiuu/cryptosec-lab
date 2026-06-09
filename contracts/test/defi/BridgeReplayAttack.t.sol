// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../../src/defi/vulnerable/VulnerableBridge.sol";
import "../../src/defi/secure/SecureBridge.sol";
import "../../src/defi/attacks/BridgeReplayAttacker.sol";

contract BridgeReplayAttackTest is Test {
    MockERC20 wrappedToken;
    MockERC20 originalToken;
    VulnerableBridge vulnBridge;
    SecureBridge secureBridge;
    BridgeReplayAttacker attacker;

    address user = address(0xCAFE);

    function setUp() external {
        wrappedToken = new MockERC20();
        originalToken = new MockERC20();

        wrappedToken.mint(address(this), 1_000_000e18);
        originalToken.mint(address(this), 1_000_000e18);
        originalToken.mint(user, 10_000e18);

        attacker = new BridgeReplayAttacker();

        vulnBridge = new VulnerableBridge(address(attacker), address(wrappedToken));
        secureBridge = new SecureBridge(address(wrappedToken));

        wrappedToken.mint(address(vulnBridge), 100_000e18);
    }

    function testBridgeMessageReplayDrainsVulnerableBridge() external {
        uint256 lockAmount = 1000e18;
        vm.prank(user);
        originalToken.approve(address(vulnBridge), lockAmount);

        vm.prank(user);
        vulnBridge.lock(address(originalToken), lockAmount, address(attacker));

        bytes memory message =
            abi.encode(address(originalToken), lockAmount, address(attacker), block.timestamp);
        attacker.captureMessage(message);

        uint256 beforeReplay = wrappedToken.balanceOf(address(attacker));
        attacker.replayMessage(address(vulnBridge), abi.encodePacked("sig"));
        uint256 afterReplay = wrappedToken.balanceOf(address(attacker));
        assertEq(afterReplay - beforeReplay, lockAmount);

        attacker.replayMessage(address(vulnBridge), abi.encodePacked("sig"));
        uint256 afterSecondReplay = wrappedToken.balanceOf(address(attacker));
        assertEq(afterSecondReplay - afterReplay, lockAmount);
    }

    function testSecureBridgeRejectsReplay() external {
        vm.prank(user);
        originalToken.approve(address(secureBridge), 1000e18);

        vm.prank(user);
        secureBridge.lock(address(originalToken), 1000e18, address(this));

        assertGt(secureBridge.nonce(), 0);
    }
}

contract MockERC20 {
    string public name = "Mock";
    string public symbol = "MCK";
    uint8 public decimals = 18;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
        totalSupply += amount;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(allowance[from][msg.sender] >= amount, "Allowance exceeded");
        require(balanceOf[from] >= amount, "Insufficient balance");
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}
