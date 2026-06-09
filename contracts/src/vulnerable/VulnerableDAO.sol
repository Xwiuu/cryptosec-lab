// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// VULNERABLE: Flash loan governance, no timelock, low quorum
contract VulnerableDAO {
    mapping(address => uint256) public votes;
    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;
    uint256 public quorum = 1; // VULNERABLE: Very low quorum
    uint256 public votingPeriod = 7 days;

    struct Proposal {
        address target;
        bytes data;
        uint256 deadline;
        uint256 forVotes;
        uint256 againstVotes;
        bool executed;
        mapping(address => bool) hasVoted;
    }

    // VULNERABLE: Votes based on current balance - flash loan can manipulate
    function delegateVotes(address from) external {
        // Insecure: doesn't use snapshot
        votes[from] += 100;
    }

    function createProposal(address target, bytes calldata data) external returns (uint256) {
        proposalCount++;
        Proposal storage p = proposals[proposalCount];
        p.target = target;
        p.data = data;
        p.deadline = block.timestamp + votingPeriod;
        return proposalCount;
    }

    // VULNERABLE: No snapshot - votes can change between proposal and vote
    function vote(uint256 proposalId, bool support) external {
        Proposal storage p = proposals[proposalId];
        require(block.timestamp < p.deadline, "Voting ended");
        require(!p.hasVoted[msg.sender], "Already voted");
        require(votes[msg.sender] > 0, "No voting power");

        p.hasVoted[msg.sender] = true;
        if (support) {
            p.forVotes += votes[msg.sender];
        } else {
            p.againstVotes += votes[msg.sender];
        }
    }

    // VULNERABLE: No timelock - proposal executes immediately after passing
    function executeProposal(uint256 proposalId) external {
        Proposal storage p = proposals[proposalId];
        require(!p.executed, "Already executed");
        require(block.timestamp >= p.deadline, "Voting not ended");
        require(p.forVotes > p.againstVotes, "Proposal didn't pass");
        require(p.forVotes >= quorum, "Quorum not met");

        p.executed = true;
        (bool ok,) = p.target.call(p.data);
        require(ok, "Execution failed");
    }
}
