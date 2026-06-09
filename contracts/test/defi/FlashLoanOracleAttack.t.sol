// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../../src/defi/vulnerable/VulnerablePriceOracle.sol";
import "../../src/defi/vulnerable/VulnerableLendingPool.sol";
import "../../src/defi/vulnerable/VulnerableFlashLoanPool.sol";
import "../../src/defi/secure/SecurePriceOracle.sol";
import "../../src/defi/secure/SecureLendingPool.sol";
import "../../src/defi/attacks/FlashLoanOracleAttacker.sol";

contract FlashLoanOracleAttackTest is Test {
    MockERC20 token;
    VulnerablePriceOracle vulnOracle;
    VulnerableLendingPool vulnLending;
    VulnerableFlashLoanPool vulnFlashLoan;
    SecurePriceOracle secureOracle;
    SecureLendingPool secureLending;
    FlashLoanOracleAttacker attacker;

    address constant LP = address(0x2222);

    function setUp() external {
        token = new MockERC20();
        token.mint(address(this), 200_000e18);
        token.mint(LP, 50_000e18);

        vulnOracle = new VulnerablePriceOracle(1e18);
        vulnLending = new VulnerableLendingPool(address(token), address(token), address(vulnOracle));
        vulnFlashLoan = new VulnerableFlashLoanPool(address(token));

        secureOracle = new SecurePriceOracle(1e18);
        secureOracle.setTrustedUpdater(address(this));
        secureLending = new SecureLendingPool(address(token), address(token), address(secureOracle));

        attacker = new FlashLoanOracleAttacker();

        vm.startPrank(LP);
        token.approve(address(vulnFlashLoan), 50_000e18);
        vulnFlashLoan.deposit(50_000e18);
        vm.stopPrank();

        token.approve(address(vulnLending), type(uint256).max);
        token.approve(address(secureLending), type(uint256).max);
    }

    function testFlashLoanManipulatesSpotOracle() external {
        uint256 borrowAmount = 5000e18;

        attacker.attack(
            address(vulnFlashLoan),
            address(token),
            address(0),
            address(vulnOracle),
            address(vulnLending),
            borrowAmount
        );

        (bool borrowed, bool manipulated, bool exploited, bool repaid) = attacker.getState();
        assertTrue(borrowed);
        assertTrue(manipulated);
        assertTrue(exploited);
        assertTrue(repaid);

        assertEq(vulnOracle.price(), 1_000_000 ether);
    }

    function testSecureOracleBlocksInstantManipulation() external {
        uint256 initialPrice = secureOracle.lastSpotPrice();
        assertEq(initialPrice, 1e18);

        secureOracle.setTrustedUpdater(address(this));
        secureOracle.updatePrice(1_000_000_000_000_000_001);

        assertEq(secureOracle.lastSpotPrice(), 1_000_000_000_000_000_001);
        assertTrue(secureOracle.lastUpdateTimestamp() > 0);
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
