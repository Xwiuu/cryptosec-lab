// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";

// EDUCATIONAL: Flash loan attack simulation
// In real DeFi, a flash loan lets you borrow without collateral
// as long as you return the funds in the same transaction.
// This test simulates the concept locally.

contract MockFlashLoanPool {
    mapping(address => uint256) public balances;

    // Simulates a flash loan: borrow funds, do something, return them
    function flashLoan(uint256 amount, address receiver, bytes calldata data)
        external
        returns (bool)
    {
        uint256 balanceBefore = address(this).balance;

        // Send funds to receiver
        (bool ok,) = receiver.call{value: amount}(data);
        require(ok, "Flash loan callback failed");

        // Check that funds were returned (with 0.1% fee)
        uint256 balanceAfter = address(this).balance;
        require(balanceAfter >= balanceBefore, "Flash loan not repaid");
        return true;
    }

    receive() external payable {}
}

contract FlashLoanAttacker {
    function executeAttack(address pool, uint256 amount) external {
        bytes memory data = abi.encodeWithSignature("callback(address,uint256)", pool, amount);
        MockFlashLoanPool(payable(pool)).flashLoan(amount, address(this), data);
    }

    function callback(address pool, uint256 amount) external payable {
        // In a real attack: manipulate oracle, swap tokens, vote in governance
        // For this demo: just repay the loan
        payable(pool).transfer(amount);
    }

    receive() external payable {}
}

contract FlashLoanAttackTest is Test {
    MockFlashLoanPool public pool;
    FlashLoanAttacker public attacker;

    function setUp() external {
        pool = new MockFlashLoanPool();
        attacker = new FlashLoanAttacker();

        vm.deal(address(pool), 100 ether);
    }

    function testFlashLoanBorrowAndRepay() external {
        // This demonstrates the flash loan pattern:
        // borrow, execute logic, repay in same tx
        uint256 amount = 10 ether;
        bytes memory data =
            abi.encodeWithSignature("callback(address,uint256)", address(pool), amount);
        pool.flashLoan(amount, address(this), data);
    }

    function callback(address poolAddr, uint256 amount) external payable {
        // Simulate attack logic here
        // Then repay the loan
        payable(poolAddr).transfer(amount);
    }

    function testFlashLoanAttackRejectedIfNotRepaid() external {
        uint256 amount = 10 ether;
        bytes memory data = abi.encodeWithSignature("failCallback()");

        vm.expectRevert();
        pool.flashLoan(amount, address(this), data);
    }

    function failCallback() external payable {
        // Do nothing - don't repay
    }
}
