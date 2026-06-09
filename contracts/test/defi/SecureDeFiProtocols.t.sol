// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../../src/defi/secure/SecureAMM.sol";
import "../../src/defi/secure/SecureLendingPool.sol";
import "../../src/defi/secure/SecureStablecoin.sol";
import "../../src/defi/secure/SecurePriceOracle.sol";
import "../../src/defi/secure/SecureFlashLoanPool.sol";
import "../../src/defi/secure/SecureYieldFarm.sol";

contract FlashLoanReceiver {
    MockERC20 public token;
    SecureFlashLoanPool public pool;

    constructor(address _token, address _pool) {
        token = MockERC20(_token);
        pool = SecureFlashLoanPool(_pool);
    }

    function executeOperation(address, uint256 amount, uint256 fee, bytes calldata)
        external
        returns (bool)
    {
        token.approve(address(pool), amount + fee);
        pool.addLiquidity(amount + fee);
        return true;
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

contract SecureDeFiProtocolsTest is Test {
    MockERC20 token0;
    MockERC20 token1;
    MockERC20 debtToken;
    MockERC20 rewardToken;
    SecureAMM amm;
    SecureLendingPool lending;
    SecureStablecoin stable;
    SecurePriceOracle oracle;
    SecureFlashLoanPool flashPool;
    SecureYieldFarm farm;
    FlashLoanReceiver flashReceiver;

    function setUp() external {
        token0 = new MockERC20();
        token1 = new MockERC20();
        debtToken = new MockERC20();
        rewardToken = new MockERC20();

        token0.mint(address(this), 100_000e18);
        token1.mint(address(this), 100_000e18);
        debtToken.mint(address(this), 100_000e18);
        rewardToken.mint(address(this), 1_000_000e18);

        amm = new SecureAMM(address(token0), address(token1));

        oracle = new SecurePriceOracle(1e18);
        oracle.setTrustedUpdater(address(this));
        lending = new SecureLendingPool(address(token0), address(debtToken), address(oracle));

        stable = new SecureStablecoin(address(token0), address(oracle));

        flashPool = new SecureFlashLoanPool(address(token0));
        flashReceiver = new FlashLoanReceiver(address(token0), address(flashPool));

        farm = new SecureYieldFarm(address(token0), address(rewardToken), 1e18);

        token0.approve(address(amm), type(uint256).max);
        token1.approve(address(amm), type(uint256).max);
        token0.approve(address(lending), type(uint256).max);
        token0.approve(address(stable), type(uint256).max);
        token0.approve(address(flashPool), type(uint256).max);
        token0.approve(address(farm), type(uint256).max);
        rewardToken.approve(address(farm), type(uint256).max);

        debtToken.approve(address(lending), type(uint256).max);
        debtToken.transfer(address(lending), 50_000e18);
        rewardToken.transfer(address(farm), 100_000e18);
    }

    function testSecureAMMOperations() external {
        amm.addLiquidity(1000e18, 1000e18, 0);

        uint256 amountOut = amm.swap(address(token0), 100e18, 0, block.timestamp + 100);
        assertGt(amountOut, 0);

        amm.swap(address(token1), amountOut, 0, block.timestamp + 100);

        uint256 shares = amm.liquidity(address(this));
        amm.removeLiquidity(shares, 0, 0);
    }

    function testSecureLendingPoolHappyPath() external {
        lending.depositCollateral(1000e18);

        uint256 maxBorrow = lending.getMaxBorrow(address(this));
        assertGt(maxBorrow, 0);

        lending.borrow(500e18);
        (uint256 coll, uint256 debt) = lending.getUserInfo(address(this));
        assertEq(coll, 1000e18);
        assertEq(debt, 500e18);

        uint256 hf = lending.getHealthFactor(address(this));
        assertGt(hf, lending.MIN_HEALTH_FACTOR());

        lending.repay(200e18);
        (coll, debt) = lending.getUserInfo(address(this));
        assertEq(debt, 300e18);

        lending.withdrawCollateral(500e18);
    }

    function testSecureStablecoinHappyPath() external {
        stable.depositCollateral(1000e18);

        stable.mint(600e18);
        uint256 bal = stable.balanceOf(address(this));
        assertEq(bal, 600e18);

        stable.approve(address(this), 600e18);
        stable.redeem(300e18);
        assertEq(stable.balanceOf(address(this)), 300e18);
    }

    function testSecureYieldFarmStaking() external {
        farm.stake(1000e18);
        assertEq(farm.stakedBalance(address(this)), 1000e18);

        vm.roll(block.number + 100);

        uint256 pending = farm.getPendingRewards(address(this));
        assertGt(pending, 0);

        farm.withdraw(500e18);
        assertEq(farm.stakedBalance(address(this)), 500e18);

        farm.withdraw(500e18);
        assertEq(farm.stakedBalance(address(this)), 0);
    }

    function testSecureFlashLoanPoolBorrowAndRepay() external {
        flashPool.addLiquidity(10_000e18);

        uint256 flashAmount = 5000e18;

        token0.transfer(address(flashReceiver), 10_000e18);
        vm.prank(address(flashReceiver));
        token0.approve(address(flashPool), 10_000e18);

        flashPool.flashLoan(flashAmount, address(flashReceiver), "0x");

        assertGt(flashPool.poolBalance(), 10_000e18);
    }
}
