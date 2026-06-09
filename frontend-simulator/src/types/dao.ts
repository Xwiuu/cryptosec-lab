export type ProposalStatus = "active" | "pending" | "executed" | "defeated" | "canceled";

export interface Proposal {
  id: string;
  title: string;
  description: string;
  proposer: string;
  status: ProposalStatus;
  createdAt: number;
  deadline: number;
  forVotes: number;
  againstVotes: number;
  abstainVotes: number;
  quorum: number;
  quorumReached: boolean;
  executionData: string;
  timelockDelay: number;
}

export interface Vote {
  voter: string;
  proposalId: string;
  support: "for" | "against" | "abstain";
  votingPower: number;
  timestamp: number;
}
