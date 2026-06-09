// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../../src/defi/vulnerable/VulnerableAMM.sol";
import "../../src/defi/secure/SecureAMM.sol";
import "../../src/defi/attacks/PriceManipulationAttacker.sol";

contract AMMPriceManipulationTest is Test {
    MockERC20 token0;
    MockERC20 token1;
    VulnerableAMM vulnAMM;
    SecureAMM secureAMM;
    PriceManipulationAttacker attacker;

    function setUp() external {
        token0 = new MockERC20();
        token1 = new MockERC20();

        token0.mint(address(this), 3000e18);
        token1.mint(address(this), 3000e18);

        vulnAMM = new VulnerableAMM(address(token0), address(token1));
        secureAMM = new SecureAMM(address(token0), address(token1));
        attacker = new PriceManipulationAttacker();

        token0.approve(address(vulnAMM), type(uint256).max);
        token1.approve(address(vulnAMM), type(uint256).max);
        token0.approve(address(secureAMM), type(uint256).max);
        token1.approve(address(secureAMM), type(uint256).max);

        vulnAMM.addLiquidity(1000e18, 1000e18);
        secureAMM.addLiquidity(1000e18, 1000e18, 0);
    }

    function testPriceManipulationAgainstVulnerableAMM() external {
        uint256 priceBefore = vulnAMM.getPrice();
        assertEq(priceBefore, 1);

        token0.transfer(address(attacker), 500e18);

        vm.prank(address(attacker));
        token0.approve(address(attacker), 500e18);

        attacker.swapToManipulatePrice(address(vulnAMM), address(token0), 500e18);

        uint256 priceAfter = vulnAMM.getPrice();

        uint256 reserve0 = vulnAMM.getReserve0();
        uint256 reserve1 = vulnAMM.getReserve1();
        assertGt(reserve0, 1000e18);
        assertLt(reserve1, 1000e18);
    }

    function testSecureAMMRequiresSlippageProtection() external {
        uint256 amountOutExpected = secureAMM.getAmountOut(address(token0), 100e18);

        vm.expectRevert();
        secureAMM.swap(address(token0), 100e18, amountOutExpected + 1, block.timestamp + 100);
    }

    function testSecureAMMRejectsExpiredDeadline() external {
        uint256 deadline = block.timestamp + 100;
        vm.warp(deadline + 1);

        vm.expectRevert();
        secureAMM.swap(address(token0), 100e18, 0, deadline);
    }

    function testSecureAMMTwapReducesManipulationImpact() external {
        for (uint256 i = 0; i < 5; i++) {
            vm.warp(block.timestamp + 1);
            secureAMM.swap(address(token0), 10e18, 0, block.timestamp + 100);
        }

        assertGt(secureAMM.price0CumulativeLast(), 0);
        assertGt(secureAMM.blockTimestampLast(), 0);
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
