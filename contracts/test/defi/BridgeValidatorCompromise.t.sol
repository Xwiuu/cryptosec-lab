// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../../src/defi/vulnerable/VulnerableBridge.sol";
import "../../src/defi/secure/SecureBridge.sol";
import "../../src/defi/attacks/BridgeValidatorCompromiseAttacker.sol";

contract BridgeValidatorCompromiseTest is Test {
    MockERC20 wrappedToken;
    MockERC20 originalToken;
    VulnerableBridge vulnBridge;
    SecureBridge secureBridge;
    BridgeValidatorCompromiseAttacker attacker;

    function setUp() external {
        wrappedToken = new MockERC20();
        originalToken = new MockERC20();

        wrappedToken.mint(address(this), 1_000_000e18);

        attacker = new BridgeValidatorCompromiseAttacker();

        vulnBridge = new VulnerableBridge(address(attacker), address(wrappedToken));
        secureBridge = new SecureBridge(address(wrappedToken));

        wrappedToken.mint(address(vulnBridge), 100_000e18);
        wrappedToken.mint(address(secureBridge), 100_000e18);
    }

    function testSingleValidatorCompromiseMintsWrappedTokens() external {
        uint256 mintAmount = 10_000e18;

        uint256 before = wrappedToken.balanceOf(address(attacker));
        attacker.exploitSingleValidator(
            address(vulnBridge), address(originalToken), mintAmount, address(attacker)
        );
        uint256 afterBal = wrappedToken.balanceOf(address(attacker));
        assertEq(afterBal - before, mintAmount);

        attacker.exploitSingleValidator(
            address(vulnBridge), address(originalToken), mintAmount, address(attacker)
        );
        uint256 afterSecond = wrappedToken.balanceOf(address(attacker));
        assertEq(afterSecond - before, mintAmount * 2);
    }

    function testSecureBridgeRequiresValidatorThreshold() external {
        address val2 = address(0x2222);

        secureBridge.addValidator(val2);
        assertEq(secureBridge.validatorCount(), 2);

        vm.expectRevert();
        secureBridge.removeValidator(address(this));
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
