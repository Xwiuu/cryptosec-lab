// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../../src/defi/vulnerable/VulnerableAMM.sol";
import "../../src/defi/secure/SecureAMM.sol";
import "../../src/defi/attacks/SandwichAttacker.sol";
import "../../src/interfaces/IDexMinimal.sol";

contract SimpleAMM is IDexMinimal {
    MockERC20 public token0;
    MockERC20 public token1;
    uint256 public reserve0;
    uint256 public reserve1;

    constructor(address _token0, address _token1) {
        token0 = MockERC20(_token0);
        token1 = MockERC20(_token1);
    }

    function addLiquidity(uint256 amount0, uint256 amount1) external {
        token0.transferFrom(msg.sender, address(this), amount0);
        token1.transferFrom(msg.sender, address(this), amount1);
        reserve0 = token0.balanceOf(address(this));
        reserve1 = token1.balanceOf(address(this));
    }

    function removeLiquidity(uint256 amount0, uint256 amount1) external {
        token0.transfer(msg.sender, amount0);
        token1.transfer(msg.sender, amount1);
        reserve0 = token0.balanceOf(address(this));
        reserve1 = token1.balanceOf(address(this));
    }

    function swap(address tokenIn, uint256 amountIn) external returns (uint256 amountOut) {
        require(tokenIn == address(token0) || tokenIn == address(token1), "Invalid token");
        if (tokenIn == address(token0)) {
            amountOut = getAmountOut(address(token0), amountIn);
            token0.transferFrom(msg.sender, address(this), amountIn);
            token1.transfer(msg.sender, amountOut);
        } else {
            amountOut = getAmountOut(address(token1), amountIn);
            token1.transferFrom(msg.sender, address(this), amountIn);
            token0.transfer(msg.sender, amountOut);
        }
        reserve0 = token0.balanceOf(address(this));
        reserve1 = token1.balanceOf(address(this));
    }

    function getAmountOut(address tokenIn, uint256 amountIn) public view returns (uint256) {
        (uint256 rIn, uint256 rOut) =
            tokenIn == address(token0) ? (reserve0, reserve1) : (reserve1, reserve0);
        return (amountIn * rOut) / (rIn + amountIn);
    }
}

contract SandwichAttackTest is Test {
    MockERC20 token0;
    MockERC20 token1;
    SimpleAMM simpleAMM;
    SecureAMM secureAMM;
    SandwichAttacker attacker;
    address victim = address(0xBEEF);

    function setUp() external {
        token0 = new MockERC20();
        token1 = new MockERC20();

        token0.mint(address(this), 5000e18);
        token1.mint(address(this), 5000e18);
        token0.mint(victim, 100e18);
        token1.mint(victim, 100e18);

        simpleAMM = new SimpleAMM(address(token0), address(token1));
        secureAMM = new SecureAMM(address(token0), address(token1));

        attacker = new SandwichAttacker();

        token0.approve(address(simpleAMM), type(uint256).max);
        token1.approve(address(simpleAMM), type(uint256).max);
        token0.approve(address(secureAMM), type(uint256).max);
        token1.approve(address(secureAMM), type(uint256).max);

        simpleAMM.addLiquidity(1000e18, 1000e18);
        secureAMM.addLiquidity(1000e18, 1000e18, 0);
    }

    function testSandwichAttackProfitsAgainstVulnerableAMM() external {
        uint256 frontRunAmount = 50e18;
        uint256 victimAmount = 100e18;

        token0.approve(address(attacker), frontRunAmount + victimAmount);
        token1.approve(address(attacker), type(uint256).max);

        uint256 expectedWithoutSandwich = simpleAMM.getAmountOut(address(token0), victimAmount);

        attacker.frontRun(address(simpleAMM), address(token0), frontRunAmount);

        attacker.executeVictimSwap(address(simpleAMM), address(token0), victimAmount);

        uint256 backRunAmount = token1.balanceOf(address(attacker));
        if (backRunAmount > 0) {
            attacker.backRun(address(simpleAMM), address(token1), backRunAmount);
        }

        uint256 profit = attacker.getProfits();
        assertGt(profit, 0);
    }

    function testSlippageProtectionBlocksSandwich() external {
        uint256 amountIn = 100e18;
        uint256 amountOut = secureAMM.getAmountOut(address(token0), amountIn);

        vm.prank(victim);
        token0.approve(address(secureAMM), amountIn);

        vm.expectRevert();
        vm.prank(victim);
        secureAMM.swap(address(token0), amountIn, amountOut + 1, block.timestamp + 100);
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
