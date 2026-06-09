// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// SECURE: Protected initializer, access-controlled upgrades, timelock delay
contract SecureUpgradeable {
    address public implementation;
    address public admin;
    uint256 public value;
    uint256 public upgradeDelay;
    uint256 public pendingUpgradeTimestamp;
    address public pendingImplementation;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    constructor() {
        admin = msg.sender;
        upgradeDelay = 2 days;
    }

    // SECURE: Cannot be re-initialized
    function initialize(address _implementation) external onlyAdmin {
        require(implementation == address(0), "Already initialized");
        implementation = _implementation;
    }

    // SECURE: Two-step upgrade with timelock
    function scheduleUpgrade(address newImplementation) external onlyAdmin {
        pendingImplementation = newImplementation;
        pendingUpgradeTimestamp = block.timestamp + upgradeDelay;
    }

    function executeUpgrade() external onlyAdmin {
        require(pendingImplementation != address(0), "No pending upgrade");
        require(block.timestamp >= pendingUpgradeTimestamp, "Timelock not elapsed");
        implementation = pendingImplementation;
        pendingImplementation = address(0);
        pendingUpgradeTimestamp = 0;
    }

    // SECURE: Cancel upgrade if needed
    function cancelUpgrade() external onlyAdmin {
        pendingImplementation = address(0);
        pendingUpgradeTimestamp = 0;
    }

    fallback() external payable {
        address impl = implementation;
        require(impl != address(0), "No implementation");
        assembly {
            let ptr := mload(0x40)
            calldatacopy(ptr, 0, calldatasize())
            let result := delegatecall(gas(), impl, ptr, calldatasize(), 0, 0)
            let size := returndatasize()
            returndatacopy(ptr, 0, size)
            switch result
            case 0 { revert(ptr, size) }
            default { return(ptr, size) }
        }
    }

    receive() external payable {}
}
