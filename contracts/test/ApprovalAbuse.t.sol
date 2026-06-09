// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/vulnerable/VulnerableToken.sol";
import "../src/vulnerable/VulnerableApprovalVault.sol";
import "../src/secure/SecureToken.sol";
import "../src/secure/SecureApprovalVault.sol";
import "../src/attacks/ApprovalAbuseAttacker.sol";

contract ApprovalAbuseTest is Test {
    VulnerableToken public vulnToken;
    VulnerableApprovalVault public vulnVault;
    ApprovalAbuseAttacker public attacker;
    SecureToken public secureToken;
    SecureApprovalVault public secureVault;

    address public victim = address(0xABCD);
    address public attackerAddr = address(0x1337);

    function setUp() external {
        vulnToken = new VulnerableToken();
        vulnVault = new VulnerableApprovalVault();
        attacker = new ApprovalAbuseAttacker();
        secureToken = new SecureToken();
        secureVault = new SecureApprovalVault();

        vulnToken.mint(victim, 1000 ether);
        secureToken.mint(victim, 1000 ether);
    }

    function testApprovalAbuseDrainsUserTokens() external {
        vm.prank(victim);
        vulnToken.approve(attackerAddr, type(uint256).max);

        vm.prank(attackerAddr);
        vulnToken.transferFrom(victim, attackerAddr, 500 ether);

        // Can drain again without additional approval
        vm.prank(attackerAddr);
        vulnToken.transferFrom(victim, attackerAddr, 500 ether);

        assertEq(vulnToken.balanceOf(attackerAddr), 1000 ether);
        assertEq(vulnToken.balanceOf(victim), 0);
    }

    function testApprovalAbuseViaAttackerContract() external {
        vm.prank(victim);
        vulnToken.approve(address(attacker), 1000 ether);

        // Test contract is owner of attacker contract
        attacker.drainToken(address(vulnToken), victim, 1000 ether);

        assertEq(vulnToken.balanceOf(address(attacker)), 1000 ether);
    }

    function testSecureVaultLimitsPullAmount() external {
        address mockToken = address(new MockERC20Approval("M", "M"));
        deal(mockToken, victim, 1000 ether);

        vm.prank(victim);
        MockERC20Approval(payable(mockToken)).approve(address(secureVault), 100 ether);

        vm.prank(victim);
        secureVault.depositToken(mockToken, 100 ether);

        assertEq(secureVault.getDeposits(victim), 100 ether);
    }

    function testSecureTokenRequiresExactAllowance() external {
        vm.prank(victim);
        secureToken.approve(attackerAddr, 100 ether);

        vm.prank(attackerAddr);
        secureToken.transferFrom(victim, attackerAddr, 100 ether);

        vm.prank(attackerAddr);
        vm.expectRevert();
        secureToken.transferFrom(victim, attackerAddr, 100 ether);
    }
}

contract MockERC20Approval {
    string public name;
    string public symbol;
    uint8 public decimals = 18;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    constructor(string memory _name, string memory _symbol) {
        name = _name;
        symbol = _symbol;
    }

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

    receive() external payable {}
}
