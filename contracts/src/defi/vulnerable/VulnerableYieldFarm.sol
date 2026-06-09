// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../../interfaces/IERC20Minimal.sol";

// VULNERABLE: intentionally insecure for educational purposes.
contract VulnerableYieldFarm {
    IERC20Minimal public stakingToken;
    IERC20Minimal public rewardToken;

    address public owner;
    uint256 public rewardPerBlock;
    uint256 public lastRewardBlock;
    uint256 public totalStaked;

    mapping(address => uint256) public stakedBalance;
    mapping(address => uint256) public userRewardPerBlockPaid;
    mapping(address => uint256) public rewards;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _stakingToken, address _rewardToken, uint256 _rewardPerBlock) {
        stakingToken = IERC20Minimal(_stakingToken);
        rewardToken = IERC20Minimal(_rewardToken);
        rewardPerBlock = _rewardPerBlock;
        lastRewardBlock = block.number;
        owner = msg.sender;
    }

    function stake(uint256 amount) external {
        stakingToken.transferFrom(msg.sender, address(this), amount);
        stakedBalance[msg.sender] += amount;
        totalStaked += amount;
    }

    function withdraw(uint256 amount) external {
        require(stakedBalance[msg.sender] >= amount, "Not enough staked");
        stakedBalance[msg.sender] -= amount;
        totalStaked -= amount;
        stakingToken.transfer(msg.sender, amount);
    }

    function claimRewards() external {
        uint256 pending = getPendingRewards(msg.sender);
        rewards[msg.sender] = 0;
        userRewardPerBlockPaid[msg.sender] = block.number;
        rewardToken.transfer(msg.sender, pending);
    }

    function getPendingRewards(address user) public view returns (uint256) {
        uint256 blocksSinceLast;
        if (userRewardPerBlockPaid[user] == 0) {
            blocksSinceLast = block.number - lastRewardBlock;
        } else {
            blocksSinceLast = block.number - userRewardPerBlockPaid[user];
        }
        return blocksSinceLast * rewardPerBlock;
    }

    function setRewardPerBlock(uint256 _rewardPerBlock) external onlyOwner {
        rewardPerBlock = _rewardPerBlock;
    }

    function emergencyWithdrawRewards() external onlyOwner {
        rewardToken.transfer(owner, rewardToken.balanceOf(address(this)));
    }
}
