// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/vulnerable/VulnerableDEX.sol";
import "../src/secure/SecureDEX.sol";

// Local simulation of front-running/MEV in an AMM-like scenario
// The attacker watches a pending transaction and places their tx first

contract SimpleAMM {
    uint256 public reserve0;
    uint256 public reserve1;

    constructor(uint256 _r0, uint256 _r1) {
        reserve0 = _r0;
        reserve1 = _r1;
    }

    // VULNERABLE: No slippage protection
    function swap(uint256 amountIn) external returns (uint256) {
        uint256 amountOut = (amountIn * reserve1) / (reserve0 + amountIn);
        reserve0 += amountIn;
        reserve1 -= amountOut;
        return amountOut;
    }

    function getPrice() external view returns (uint256) {
        return reserve1 / reserve0;
    }
}

contract FrontRunningSimulationTest is Test {
    SimpleAMM public amm;

    function setUp() external {
        amm = new SimpleAMM(100 ether, 100 ether);
    }

    function testSandwichAttackAgainstVulnerableAMM() external {
        // Victim's expected output without front-running
        uint256 victimExpected = amm.swap(10 ether);
        emit log_named_uint("Victim would receive (no front-run)", victimExpected);

        // Simulate sandwich attack
        SimpleAMM amm2 = new SimpleAMM(100 ether, 100 ether);

        // 1. Attacker front-runs: buys before victim
        amm2.swap(5 ether);

        // 2. Victim executes (worse price now)
        uint256 victimAfterFront = amm2.swap(10 ether);

        // Assert victim got less due to front-running
        assertLt(victimAfterFront, victimExpected);
        emit log_named_uint("Victim received (after front-run)", victimAfterFront);
    }

    function testSandwichCausesPriceSlippage() external {
        SimpleAMM amm2 = new SimpleAMM(100 ether, 100 ether);

        uint256 priceBefore = amm2.reserve1() / amm2.reserve0();
        emit log_named_uint("Price before front-run", priceBefore);

        amm2.swap(5 ether);

        // Price is now different due to the swap
        uint256 priceAfter = amm2.reserve1() / amm2.reserve0();
        emit log_named_uint("Price after front-run", priceAfter);

        // Price should have changed
        assertFalse(priceBefore == priceAfter);
    }

    // Vulnerable DEX test - no slippage protection
    function testVulnerableDEXNoSlippageProtection() external {
        VulnerableTokenMock token0 = new VulnerableTokenMock();
        VulnerableTokenMock token1 = new VulnerableTokenMock();

        VulnerableDEX vulnDEX = new VulnerableDEX(address(token0), address(token1));

        token0.mint(address(this), 1000 ether);
        token1.mint(address(this), 1000 ether);

        token0.approve(address(vulnDEX), 1000 ether);
        token1.approve(address(vulnDEX), 1000 ether);

        vulnDEX.addLiquidity(100 ether, 100 ether);

        // Swap without slippage protection
        uint256 amountOut = vulnDEX.swap(address(token0), 10 ether);
        assertGt(amountOut, 0);
    }
}

contract VulnerableTokenMock {
    string public name = "Token";
    string public symbol = "TKN";
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
