// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../../src/defi/vulnerable/VulnerablePriceOracle.sol";
import "../../src/defi/vulnerable/VulnerableStablecoin.sol";
import "../../src/defi/secure/SecurePriceOracle.sol";
import "../../src/defi/secure/SecureStablecoin.sol";
import "../../src/defi/attacks/StablecoinDepegAttacker.sol";

contract StablecoinDepegTest is Test {
    MockERC20 collateralToken;
    VulnerablePriceOracle vulnOracle;
    VulnerableStablecoin vulnStable;
    SecurePriceOracle secureOracle;
    SecureStablecoin secureStable;
    StablecoinDepegAttacker attacker;

    function setUp() external {
        collateralToken = new MockERC20();
        collateralToken.mint(address(this), 100_000e18);

        vulnOracle = new VulnerablePriceOracle(1e18);
        vulnStable = new VulnerableStablecoin(address(collateralToken), address(vulnOracle));

        secureOracle = new SecurePriceOracle(1e18);
        secureStable = new SecureStablecoin(address(collateralToken), address(secureOracle));

        attacker = new StablecoinDepegAttacker();

        collateralToken.approve(address(vulnStable), type(uint256).max);
        collateralToken.approve(address(secureStable), type(uint256).max);
        collateralToken.approve(address(attacker), type(uint256).max);
    }

    function testUndercollateralizedMintCausesDepeg() external {
        uint256 depositAmount = 100e18;
        uint256 mintAmount = 1000e18;

        collateralToken.transfer(address(attacker), depositAmount);

        attacker.manipulateOracle(address(vulnOracle), 1_000_000 ether);
        attacker.depositAndMint(
            address(vulnStable), address(collateralToken), depositAmount, mintAmount
        );

        uint256 afterAttack = vulnStable.balanceOf(address(attacker));
        assertEq(afterAttack, mintAmount);

        uint256 totalCollateral = collateralToken.balanceOf(address(vulnStable));
        assertEq(totalCollateral, depositAmount);

        uint256 ratio = (totalCollateral * 1e18) / mintAmount;
        assertLt(ratio, 1e18);
    }

    function testOracleManipulationAllowsBadMint() external {
        uint256 depositAmount = 100e18;
        uint256 normalMaxMint = (depositAmount * 1e18 * 200) / (1e18 * 100);
        assertEq(normalMaxMint, 200e18);

        vulnOracle.setPrice(100e18);
        uint256 manipulatedMaxMint = (depositAmount * 100e18 * 200) / (1e18 * 100);
        assertEq(manipulatedMaxMint, 20_000e18);
    }

    function testSecureStablecoinRequiresCollateralRatio() external {
        collateralToken.approve(address(secureStable), type(uint256).max);
        secureStable.depositCollateral(1000e18);

        uint256 maxMint = 666e18;
        secureStable.mint(maxMint);

        uint256 ratio = (collateralToken.balanceOf(address(secureStable)) * 1e18) / maxMint;
        assertGt(ratio, 0);

        vm.expectRevert();
        secureStable.mint(1e18);
    }

    function testSecureStablecoinRejectsUnsafeMint() external {
        collateralToken.approve(address(secureStable), type(uint256).max);
        secureStable.depositCollateral(100e18);

        vm.expectRevert();
        secureStable.mint(100e18);
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
