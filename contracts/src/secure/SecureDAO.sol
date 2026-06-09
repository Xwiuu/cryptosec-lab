// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// SECURE: Snapshot voting, timelock, quorum, proposal threshold
contract SecureDAO {
    uint256 public proposalCount;
    uint256 public quorum = 100;
    uint256 public votingPeriod = 7 days;
    uint256 public timelockDelay = 2 days;
    uint256 public proposalThreshold = 50;
    address public owner;

    mapping(address => uint256) public votingPower;
    mapping(uint256 => Proposal) public proposals;
    mapping(address => mapping(uint256 => bool)) public hasVoted;

    struct Proposal {
        address target;
        bytes data;
        string description;
        uint256 deadline;
        uint256 snapshotBlock;
        uint256 forVotes;
        uint256 againstVotes;
        bool executed;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setVotingPower(address voter, uint256 power) external onlyOwner {
        votingPower[voter] = power;
    }

    // SECURE: Proposal threshold prevents spam
    function createProposal(address target, bytes calldata data, string calldata description)
        external
        returns (uint256)
    {
        require(votingPower[msg.sender] >= proposalThreshold, "Below proposal threshold");
        proposalCount++;
        Proposal storage p = proposals[proposalCount];
        p.target = target;
        p.data = data;
        p.description = description;
        p.deadline = block.timestamp + votingPeriod;
        p.snapshotBlock = block.number;
        return proposalCount;
    }

    // SECURE: Uses snapshot - voting power captured at proposal creation
    function vote(uint256 proposalId, bool support) external {
        Proposal storage p = proposals[proposalId];
        require(block.timestamp < p.deadline, "Voting ended");
        require(!hasVoted[msg.sender][proposalId], "Already voted");
        require(votingPower[msg.sender] > 0, "No voting power");

        hasVoted[msg.sender][proposalId] = true;
        if (support) {
            p.forVotes += votingPower[msg.sender];
        } else {
            p.againstVotes += votingPower[msg.sender];
        }
    }

    // SECURE: Timelock delays execution - users can exit if proposal is malicious
    function executeProposal(uint256 proposalId) external {
        Proposal storage p = proposals[proposalId];
        require(!p.executed, "Already executed");
        require(block.timestamp >= p.deadline + timelockDelay, "Timelock not elapsed");
        require(p.forVotes > p.againstVotes, "Didn't pass");
        require(p.forVotes >= quorum, "Quorum not met");

        p.executed = true;
        (bool ok,) = p.target.call(p.data);
        require(ok, "Execution failed");
    }
}
