// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../../src/defi/vulnerable/VulnerableAMM.sol";
import "../../src/defi/attacks/LiquidityRugPullAttacker.sol";

contract LiquidityRugPullTest is Test {
    MockERC20 token0;
    MockERC20 token1;
    VulnerableAMM vulnAMM;
    LiquidityRugPullAttacker attacker;

    address user = address(0xDEAD);

    function setUp() external {
        token0 = new MockERC20();
        token1 = new MockERC20();

        token0.mint(address(this), 100_000e18);
        token1.mint(address(this), 100_000e18);
        token0.mint(address(attacker), 5000e18);
        token1.mint(address(attacker), 5000e18);
        token0.mint(user, 1000e18);
        token1.mint(user, 1000e18);

        vulnAMM = new VulnerableAMM(address(token0), address(token1));
        attacker = new LiquidityRugPullAttacker();

        token0.approve(address(vulnAMM), type(uint256).max);
        token1.approve(address(vulnAMM), type(uint256).max);
    }

    function testLiquidityProviderCanRugPull() external {
        uint256 addAmount0 = 2000e18;
        uint256 addAmount1 = 2000e18;

        token0.transfer(address(attacker), addAmount0);
        token1.transfer(address(attacker), addAmount1);

        token0.approve(address(attacker), addAmount0);
        token1.approve(address(attacker), addAmount1);

        attacker.addLiquidityAndPromote(
            address(vulnAMM), address(token0), address(token1), addAmount0, addAmount1
        );

        uint256 poolBalance0Before = token0.balanceOf(address(vulnAMM));
        uint256 poolBalance1Before = token1.balanceOf(address(vulnAMM));
        assertEq(poolBalance0Before, addAmount0);
        assertEq(poolBalance1Before, addAmount1);

        attacker.rugPull(address(vulnAMM));

        uint256 poolBalance0After = token0.balanceOf(address(vulnAMM));
        uint256 poolBalance1After = token1.balanceOf(address(vulnAMM));

        assertEq(poolBalance0After, 0);
        assertEq(poolBalance1After, 0);

        assertGt(attacker.getProfits(), 0);
    }

    function testLockedLiquidityPreventsImmediateRugPull() external {
        uint256 addAmount0 = 1000e18;
        uint256 addAmount1 = 1000e18;

        token0.transfer(address(attacker), addAmount0);
        token1.transfer(address(attacker), addAmount1);

        token0.approve(address(attacker), addAmount0);
        token1.approve(address(attacker), addAmount1);

        attacker.addLiquidityAndPromote(
            address(vulnAMM), address(token0), address(token1), addAmount0, addAmount1
        );

        vm.startPrank(user);
        token0.approve(address(vulnAMM), addAmount0);
        token1.approve(address(vulnAMM), addAmount1);
        vulnAMM.addLiquidity(100e18, 100e18);
        vm.stopPrank();

        attacker.rugPull(address(vulnAMM));

        uint256 poolBalance0After = token0.balanceOf(address(vulnAMM));
        uint256 poolBalance1After = token1.balanceOf(address(vulnAMM));

        assertGt(poolBalance0After, 0);
        assertGt(poolBalance1After, 0);

        uint256 userDeposited0 = vulnAMM.deposited0(user);
        uint256 userDeposited1 = vulnAMM.deposited1(user);
        assertGt(userDeposited0, 0);
        assertGt(userDeposited1, 0);
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
