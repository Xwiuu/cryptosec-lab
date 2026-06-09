// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// SECURE: Reentrancy protected using checks-effects-interactions pattern
contract SecureBank {
    mapping(address => uint256) public balances;
    bool internal _locked;

    modifier noReentrancy() {
        require(!_locked, "Reentrancy detected");
        _locked = true;
        _;
        _locked = false;
    }

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    // SECURE: Update state BEFORE external call (checks-effects-interactions)
    function withdraw(uint256 amount) external noReentrancy {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        (bool ok,) = msg.sender.call{value: amount}("");
        require(ok, "Transfer failed");
    }

    function getBalance() external view returns (uint256) {
        return balances[msg.sender];
    }

    receive() external payable {}
}
