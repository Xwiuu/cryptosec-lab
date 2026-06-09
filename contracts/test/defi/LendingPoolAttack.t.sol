// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../../src/defi/vulnerable/VulnerablePriceOracle.sol";
import "../../src/defi/vulnerable/VulnerableLendingPool.sol";
import "../../src/defi/secure/SecurePriceOracle.sol";
import "../../src/defi/secure/SecureLendingPool.sol";
import "../../src/defi/attacks/LendingDrainAttacker.sol";

contract LendingPoolAttackTest is Test {
    MockERC20 collateralToken;
    MockERC20 borrowToken;
    VulnerablePriceOracle vulnOracle;
    VulnerableLendingPool vulnLending;
    SecurePriceOracle secureOracle;
    SecureLendingPool secureLending;
    LendingDrainAttacker attacker;

    function setUp() external {
        collateralToken = new MockERC20();
        borrowToken = new MockERC20();

        collateralToken.mint(address(this), 100_000e18);
        borrowToken.mint(address(this), 300_000e18);

        vulnOracle = new VulnerablePriceOracle(1e18);
        vulnLending = new VulnerableLendingPool(
            address(collateralToken), address(borrowToken), address(vulnOracle)
        );

        secureOracle = new SecurePriceOracle(1e18);
        secureOracle.setTrustedUpdater(address(this));
        secureLending = new SecureLendingPool(
            address(collateralToken), address(borrowToken), address(secureOracle)
        );

        attacker = new LendingDrainAttacker();

        collateralToken.approve(address(vulnLending), type(uint256).max);
        collateralToken.approve(address(secureLending), type(uint256).max);

        borrowToken.transfer(address(vulnLending), 100_000e18);
        borrowToken.transfer(address(secureLending), 100_000e18);
    }

    function testAttackerBorrowsTooMuchWithManipulatedOracle() external {
        uint256 depositAmount = 10e18;
        uint256 borrowAmount = 10_000e18;

        collateralToken.transfer(address(attacker), depositAmount);

        attacker.attack(
            address(vulnLending),
            address(vulnOracle),
            address(collateralToken),
            address(borrowToken),
            depositAmount,
            borrowAmount
        );

        assertGt(borrowToken.balanceOf(address(attacker)), 0);
    }

    function testVulnerableLendingCanBecomeInsolvent() external {
        uint256 depositAmount = 10e18;
        uint256 borrowAmount = 50_000e18;

        collateralToken.transfer(address(attacker), depositAmount);
        borrowToken.transfer(address(vulnLending), 50_000e18);

        attacker.attack(
            address(vulnLending),
            address(vulnOracle),
            address(collateralToken),
            address(borrowToken),
            depositAmount,
            borrowAmount
        );

        assertGt(borrowToken.balanceOf(address(attacker)), 0);
    }

    function testSecureLendingRejectsUnsafeBorrow() external {
        collateralToken.approve(address(secureLending), type(uint256).max);
        secureLending.depositCollateral(10e18);

        uint256 maxBorrow = secureLending.getMaxBorrow(address(this));
        uint256 safeBorrow = maxBorrow;

        if (safeBorrow > 0) {
            secureLending.borrow(safeBorrow);
            (uint256 coll, uint256 debt) = secureLending.getUserInfo(address(this));
            assertEq(debt, safeBorrow);
        }
    }

    function testSecureLendingMaintainsHealthFactor() external {
        collateralToken.approve(address(secureLending), type(uint256).max);
        secureLending.depositCollateral(1000e18);

        uint256 maxBorrow = secureLending.getMaxBorrow(address(this));
        uint256 borrowAmt = maxBorrow * 90 / 100;

        secureLending.borrow(borrowAmt);

        uint256 hf = secureLending.getHealthFactor(address(this));
        assertGt(hf, secureLending.MIN_HEALTH_FACTOR());

        uint256 excessBorrow = maxBorrow + 1;
        vm.expectRevert();
        secureLending.borrow(excessBorrow);
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
