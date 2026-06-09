// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../../src/defi/vulnerable/VulnerablePriceOracle.sol";
import "../../src/defi/vulnerable/VulnerableLendingPool.sol";
import "../../src/defi/vulnerable/VulnerableLiquidationEngine.sol";
import "../../src/defi/secure/SecurePriceOracle.sol";
import "../../src/defi/secure/SecureLendingPool.sol";
import "../../src/defi/secure/SecureLiquidationEngine.sol";
import "../../src/defi/attacks/LiquidationAttacker.sol";

contract LiquidationAttackTest is Test {
    MockERC20 collateralToken;
    MockERC20 debtToken;
    VulnerablePriceOracle vulnOracle;
    VulnerableLendingPool vulnLending;
    VulnerableLiquidationEngine vulnEngine;
    SecurePriceOracle secureOracle;
    SecureLendingPool secureLending;
    SecureLiquidationEngine secureEngine;

    address borrower = address(0xAAAA);
    address liquidatorAddr = address(0xBBBB);

    function setUp() external {
        collateralToken = new MockERC20();
        debtToken = new MockERC20();

        collateralToken.mint(borrower, 10_000e18);
        collateralToken.mint(address(this), 10_000e18);
        debtToken.mint(address(this), 300_000e18);

        vulnOracle = new VulnerablePriceOracle(1e18);
        vulnLending = new VulnerableLendingPool(
            address(collateralToken), address(debtToken), address(vulnOracle)
        );
        vulnEngine = new VulnerableLiquidationEngine(address(vulnLending), address(vulnOracle));

        secureOracle = new SecurePriceOracle(1e18);
        secureOracle.setTrustedUpdater(address(this));
        secureLending = new SecureLendingPool(
            address(collateralToken), address(debtToken), address(secureOracle)
        );
        secureEngine = new SecureLiquidationEngine(address(secureLending), address(secureOracle));

        vm.startPrank(borrower);
        collateralToken.approve(address(vulnLending), type(uint256).max);
        collateralToken.approve(address(secureLending), type(uint256).max);
        vm.stopPrank();

        collateralToken.approve(address(secureLending), type(uint256).max);

        debtToken.transfer(address(vulnLending), 100_000e18);
        debtToken.transfer(address(secureLending), 100_000e18);
    }

    function testHealthyPositionCanBeLiquidatedInVulnerableEngine() external {
        vm.startPrank(borrower);
        vulnLending.depositCollateral(1000e18);
        vulnLending.borrow(600e18);
        vm.stopPrank();

        uint256 hf = vulnEngine.getHealthFactor(borrower);
        assertLt(hf, 2e18);

        debtToken.transfer(liquidatorAddr, 50_000e18);
        vm.prank(liquidatorAddr);
        debtToken.approve(address(vulnEngine), 50_000e18);
        vm.prank(liquidatorAddr);
        vulnEngine.liquidate(borrower, 100e18);
    }

    function testManipulatedPriceTriggersBadLiquidation() external {
        vm.startPrank(borrower);
        vulnLending.depositCollateral(500e18);
        vulnLending.borrow(50e18);
        vm.stopPrank();

        uint256 hfBefore = vulnEngine.getHealthFactor(borrower);
        assertGt(hfBefore, 2e18);

        vulnOracle.setPrice(0.01e18);

        uint256 hfAfter = vulnEngine.getHealthFactor(borrower);
        assertLt(hfAfter, 2e18);

        debtToken.transfer(liquidatorAddr, 50_000e18);
        vm.prank(liquidatorAddr);
        debtToken.approve(address(vulnEngine), 50_000e18);
        vm.prank(liquidatorAddr);
        vulnEngine.liquidate(borrower, 25e18);

        assertTrue(vulnEngine.isLiquidated(borrower));
    }

    function testSecureLiquidationRejectsHealthyPosition() external {
        collateralToken.approve(address(secureLending), type(uint256).max);
        secureLending.depositCollateral(1000e18);
        secureLending.borrow(100e18);

        uint256 hf = secureEngine.getHealthFactor(address(this));
        assertGt(hf, secureEngine.MIN_HEALTH_FACTOR());

        vm.expectRevert();
        secureEngine.liquidate(address(this), 50e18, address(collateralToken), address(debtToken));
    }

    function testSecureLiquidationUsesCloseFactor() external {
        collateralToken.approve(address(secureLending), type(uint256).max);
        secureLending.depositCollateral(500e18);
        uint256 maxBorrow = secureLending.getMaxBorrow(address(this));
        secureLending.borrow(maxBorrow);

        uint256 hf = secureEngine.getHealthFactor(address(this));
        assertGt(hf, secureEngine.MIN_HEALTH_FACTOR());

        vm.expectRevert();
        secureEngine.liquidate(address(this), 100e18, address(collateralToken), address(debtToken));
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
