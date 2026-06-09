// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../../interfaces/IERC20Minimal.sol";

contract SecureYieldFarm {
    IERC20Minimal public immutable stakingToken;
    IERC20Minimal public immutable rewardToken;

    address public owner;
    bool public paused;

    uint256 public rewardPerBlock;
    uint256 public lastRewardBlock;
    uint256 public accRewardPerShare;
    uint256 public totalStaked;
    uint256 public rewardRateUpdateTimestamp;

    uint256 public constant REWARD_PRECISION = 1e12;
    uint256 public constant MAX_STAKE = 1_000_000_000 ether;
    uint256 public constant TIMELOCK_DELAY = 3 days;

    mapping(address => uint256) public stakedBalance;
    mapping(address => uint256) public rewardDebt;

    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event RewardRateUpdated(uint256 oldRate, uint256 newRate);
    event Paused(address indexed account);
    event Unpaused(address indexed account);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Paused");
        _;
    }

    modifier updatePool() {
        if (totalStaked == 0) {
            lastRewardBlock = block.number;
        } else {
            uint256 blocksSinceLastUpdate = block.number - lastRewardBlock;
            if (blocksSinceLastUpdate > 0) {
                uint256 reward = blocksSinceLastUpdate * rewardPerBlock;
                accRewardPerShare += (reward * REWARD_PRECISION) / totalStaked;
                lastRewardBlock = block.number;
            }
        }
        _;
    }

    constructor(address _stakingToken, address _rewardToken, uint256 _rewardPerBlock) {
        require(_stakingToken != address(0), "Zero staking token");
        require(_rewardToken != address(0), "Zero reward token");
        require(_rewardPerBlock > 0, "Reward per block must be > 0");
        stakingToken = IERC20Minimal(_stakingToken);
        rewardToken = IERC20Minimal(_rewardToken);
        rewardPerBlock = _rewardPerBlock;
        owner = msg.sender;
        lastRewardBlock = block.number;
    }

    function stake(uint256 amount) external whenNotPaused updatePool {
        require(amount > 0, "Amount must be > 0");
        require(totalStaked + amount <= MAX_STAKE, "Max stake reached");
        if (stakedBalance[msg.sender] > 0) {
            uint256 pending = (stakedBalance[msg.sender] * accRewardPerShare) / REWARD_PRECISION
                - rewardDebt[msg.sender];
            if (pending > 0) {
                rewardToken.transfer(msg.sender, pending);
                emit RewardsClaimed(msg.sender, pending);
            }
        }
        stakingToken.transferFrom(msg.sender, address(this), amount);
        stakedBalance[msg.sender] += amount;
        totalStaked += amount;
        rewardDebt[msg.sender] = (stakedBalance[msg.sender] * accRewardPerShare) / REWARD_PRECISION;
        emit Staked(msg.sender, amount);
    }

    function withdraw(uint256 amount) external whenNotPaused updatePool {
        require(amount > 0, "Amount must be > 0");
        require(stakedBalance[msg.sender] >= amount, "Insufficient staked balance");
        uint256 pending = (stakedBalance[msg.sender] * accRewardPerShare) / REWARD_PRECISION
            - rewardDebt[msg.sender];
        if (pending > 0) {
            rewardToken.transfer(msg.sender, pending);
            emit RewardsClaimed(msg.sender, pending);
        }
        stakedBalance[msg.sender] -= amount;
        totalStaked -= amount;
        rewardDebt[msg.sender] = (stakedBalance[msg.sender] * accRewardPerShare) / REWARD_PRECISION;
        stakingToken.transfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }

    function claimRewards() external updatePool {
        uint256 pending = (stakedBalance[msg.sender] * accRewardPerShare) / REWARD_PRECISION
            - rewardDebt[msg.sender];
        require(pending > 0, "No pending rewards");
        rewardDebt[msg.sender] = (stakedBalance[msg.sender] * accRewardPerShare) / REWARD_PRECISION;
        rewardToken.transfer(msg.sender, pending);
        emit RewardsClaimed(msg.sender, pending);
    }

    function getPendingRewards(address user) external view returns (uint256) {
        if (totalStaked == 0) return 0;
        uint256 _accRewardPerShare = accRewardPerShare;
        uint256 blocksSinceLastUpdate = block.number - lastRewardBlock;
        if (blocksSinceLastUpdate > 0) {
            uint256 reward = blocksSinceLastUpdate * rewardPerBlock;
            _accRewardPerShare += (reward * REWARD_PRECISION) / totalStaked;
        }
        return (stakedBalance[user] * _accRewardPerShare) / REWARD_PRECISION - rewardDebt[user];
    }

    function emergencyWithdraw() external {
        uint256 amount = stakedBalance[msg.sender];
        require(amount > 0, "Nothing to withdraw");
        stakedBalance[msg.sender] = 0;
        totalStaked -= amount;
        rewardDebt[msg.sender] = 0;
        stakingToken.transfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }

    function setRewardPerBlock(uint256 _rewardPerBlock) external onlyOwner {
        require(
            block.timestamp >= rewardRateUpdateTimestamp + TIMELOCK_DELAY
                || rewardRateUpdateTimestamp == 0,
            "Timelock not elapsed"
        );
        emit RewardRateUpdated(rewardPerBlock, _rewardPerBlock);
        rewardPerBlock = _rewardPerBlock;
        rewardRateUpdateTimestamp = block.timestamp;
    }

    function pause() external onlyOwner {
        paused = true;
        emit Paused(msg.sender);
    }

    function unpause() external onlyOwner {
        paused = false;
        emit Unpaused(msg.sender);
    }
}
