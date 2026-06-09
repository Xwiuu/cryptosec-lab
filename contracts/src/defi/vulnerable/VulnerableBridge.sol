// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../../interfaces/IERC20Minimal.sol";

// VULNERABLE: intentionally insecure for educational purposes.
contract VulnerableBridge {
    address public validator;
    IERC20Minimal public wrappedToken;

    mapping(address => uint256) public lockedTokens;
    mapping(address => uint256) public wrappedSupply;

    event Lock(bytes message);
    event Mint(bytes message);

    modifier onlyValidator() {
        require(msg.sender == validator, "Only validator");
        _;
    }

    constructor(address _validator, address _wrappedToken) {
        validator = _validator;
        wrappedToken = IERC20Minimal(_wrappedToken);
    }

    function lock(address token, uint256 amount, address to) external {
        IERC20Minimal(token).transferFrom(msg.sender, address(this), amount);
        lockedTokens[token] += amount;
        bytes memory message = abi.encode(token, amount, to, block.timestamp);
        emit Lock(message);
    }

    function mintWrapped(bytes calldata message, bytes calldata) external onlyValidator {
        (address originalToken, uint256 amount, address to) =
            abi.decode(message, (address, uint256, address));
        wrappedToken.transfer(to, amount);
        wrappedSupply[originalToken] += amount;
        emit Mint(message);
    }

    function burn(address originalToken, uint256 amount, address to) external {
        wrappedToken.transferFrom(msg.sender, address(this), amount);
        wrappedSupply[originalToken] -= amount;
    }

    function release(bytes calldata message, bytes calldata) external onlyValidator {
        (address token, uint256 amount, address to) =
            abi.decode(message, (address, uint256, address));
        require(lockedTokens[token] >= amount, "Insufficient locked balance");
        lockedTokens[token] -= amount;
        IERC20Minimal(token).transfer(to, amount);
    }

    function setValidator(address _validator) external onlyValidator {
        validator = _validator;
    }
}
