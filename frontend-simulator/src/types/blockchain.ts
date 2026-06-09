export type BlockStatus = "valid" | "invalid" | "pending" | "orphaned" | "tampered";
export type ConsensusType = "pow" | "pos";
export type RiskFlag = "none" | "weak_hash" | "difficulty_bypass" | "timestamp_manipulation" | "chain_tampering" | "fork" | "invalid_previous_hash";

export interface Block {
  index: number;
  hash: string;
  previousHash: string;
  timestamp: number;
  nonce: number;
  difficulty: number;
  miner: string;
  txCount: number;
  status: BlockStatus;
  riskFlags: RiskFlag[];
  size: number;
  transactions: string[];
}

export interface ChainMetrics {
  totalBlocks: number;
  totalTransactions: number;
  totalAddresses: number;
  averageBlockTime: number;
  currentDifficulty: number;
  chainSize: string;
  lastBlockHash: string;
  consensusType: ConsensusType;
  activeValidators: number;
  totalValidators: number;
  epoch: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  checkedAt: number;
  checkedBlocks: number;
}

export interface Fork {
  id: string;
  startBlock: number;
  endBlock: number;
  blocks: Block[];
  isValid: boolean;
  createdBy: string;
  timestamp: number;
}

export interface NodeInfo {
  id: string;
  name: string;
  type: "honest" | "attacker" | "validator" | "offline";
  status: "online" | "offline" | "syncing";
  chain: number;
  blocks: number;
  peers: number;
  version: string;
  latency: number;
  stake: number;
  lastSeen: number;
}
