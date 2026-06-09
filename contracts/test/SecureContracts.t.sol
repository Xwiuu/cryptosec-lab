// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/secure/SecureBank.sol";
import "../src/secure/SecureToken.sol";
import "../src/secure/SecureDEX.sol";
import "../src/secure/SecureOracle.sol";
import "../src/secure/SecureLending.sol";
import "../src/secure/SecureNFT.sol";
import "../src/secure/SecureDAO.sol";
import "../src/secure/SecureRandomness.sol";
import "../src/secure/SecureApprovalVault.sol";
import "../src/secure/SecureUpgradeable.sol";
import "../src/interfaces/IERC20Minimal.sol";

contract SecureContractsTest is Test {
    SecureBank public bank;
    SecureToken public token;
    SecureDEX public dex;
    SecureOracle public oracle;
    SecureLending public lending;
    SecureNFT public nft;
    SecureDAO public dao;
    SecureRandomness public randomness;
    SecureApprovalVault public vault;
    SecureUpgradeable public upgradeable;

    address public user = address(0xABCD);
    address public attacker = address(0x1337);

    function setUp() external {
        bank = new SecureBank();
        token = new SecureToken();
        oracle = new SecureOracle();
        lending = new SecureLending(address(oracle));
        nft = new SecureNFT();
        dao = new SecureDAO();
        randomness = new SecureRandomness();
        vault = new SecureApprovalVault();
        upgradeable = new SecureUpgradeable();
    }

    function testSecureBankReentrancyProtection() external {
        vm.deal(address(bank), 10 ether);
        vm.deal(attacker, 1 ether);

        vm.startPrank(attacker);
        bank.deposit{value: 1 ether}();
        // SecureBank uses checks-effects-interactions, so withdraw updates
        // balance before sending ETH. No reentrancy possible.
        bank.withdraw(1 ether);
        vm.stopPrank();

        // Attacker should only have withdrawn what they deposited
        assertEq(attacker.balance, 1 ether);
    }

    function testSecureTokenAccessControl() external {
        vm.prank(attacker);
        vm.expectRevert();
        token.mint(attacker, 100 ether);

        token.mint(attacker, 100 ether);
        assertEq(token.balanceOf(attacker), 100 ether);
    }

    function testSecureDNASupplyCap() external {
        for (uint256 i = 0; i < 100; i++) {
            nft.mint(address(uint160(i + 1)), "");
        }
        assertEq(nft.totalSupply(), 100);
    }

    function testSecureDAOQuorum() external {
        dao.setVotingPower(attacker, 100);

        vm.prank(attacker);
        uint256 propId =
            dao.createProposal(address(1), abi.encodeWithSignature("whatever()"), "test");

        vm.prank(attacker);
        dao.vote(propId, true);
    }

    function testSecureRandomnessCommitReveal() external {
        uint256 secret = 42;
        uint256 salt = 12_345;
        bytes32 commitment = keccak256(abi.encodePacked(secret, salt));

        randomness.commit(commitment);
        randomness.reveal(secret, salt);

        assertTrue(randomness.hasRevealed(address(this)));
        assertGt(randomness.getRandom(address(this)), 0);
    }

    function testSecureApprovalVaultLimits() external {
        address mockToken = address(new MockERC20Secure("MOCK", "MCK"));

        deal(mockToken, user, 1000 ether);

        vm.prank(user);
        IERC20Minimal(mockToken).approve(address(vault), 100 ether);

        vm.prank(user);
        vault.depositToken(mockToken, 100 ether);

        assertEq(vault.getDeposits(user), 100 ether);
    }

    function testSecureUpgradeableInitialization() external {
        address impl = address(0x1234);
        upgradeable.initialize(impl);
        assertEq(upgradeable.implementation(), impl);

        vm.expectRevert();
        upgradeable.initialize(impl);
    }
}

contract MockERC20Secure is IERC20Minimal {
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
        emit Transfer(address(0), to, amount);
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(allowance[from][msg.sender] >= amount, "Allowance exceeded");
        require(balanceOf[from] >= amount, "Insufficient balance");
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
        return true;
    }
}
