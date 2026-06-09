export const blocks = Array.from({ length: 25 }, (_, i) => ({
  index: 184_700 + i + 1,
  hash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
  previousHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
  timestamp: 1_704_000_000 + i * 12,
  nonce: Math.floor(Math.random() * 1_000_000),
  difficulty: 4 + Math.floor(Math.random() * 3),
  miner: `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
  txCount: Math.floor(Math.random() * 15) + 1,
  status: "valid" as const,
  riskFlags: [] as string[],
  size: Math.floor(Math.random() * 5000) + 1000,
  transactions: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, () =>
    `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`
  ),
}));

// Insert a tampered block
export const tamperedBlock = {
  index: 184_712,
  hash: "0x0000deadbeef0000000000000000000000000000000000000000000000000000",
  previousHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
  timestamp: 1_704_000_500,
  nonce: 0,
  difficulty: 1,
  miner: "0x0000000000000000000000000000000000000000",
  txCount: 0,
  status: "tampered" as const,
  riskFlags: ["weak_hash", "difficulty_bypass", "invalid_previous_hash"],
  size: 42,
  transactions: [],
};

export const chainMetrics = {
  totalBlocks: 184_723,
  totalTransactions: 892_451,
  totalAddresses: 45_231,
  averageBlockTime: 2.3,
  currentDifficulty: 5,
  chainSize: "847.23 MB",
  lastBlockHash: "0x7f3a9b2c...e8d1f4a6",
  consensusType: "pos" as const,
  activeValidators: 47,
  totalValidators: 60,
  epoch: 142,
};

export const validationResult = {
  isValid: false,
  errors: ["Block #184712 has invalid previous_hash", "Block #184712 has weak hash (0000 prefix)"],
  warnings: ["Block #184712 nonce is 0 (difficulty bypass)", "Chain fork detected at block #184712"],
  checkedAt: Date.now(),
  checkedBlocks: 25,
};

export const forks = [
  {
    id: "fork-1",
    startBlock: 184_710,
    endBlock: 184_715,
    blocks: [
      { index: 184_710, hash: "0x7a3b...c9d2", difficulty: 5, status: "valid" },
      { index: 184_711, hash: "0x8c4d...e0f3", difficulty: 5, status: "valid" },
      { index: 184_712, hash: "0x0000...0000", difficulty: 1, status: "invalid" },
    ],
    isValid: false,
    createdBy: "attacker_node_01",
    timestamp: Date.now() - 3600_000,
  },
  {
    id: "fork-2",
    startBlock: 184_715,
    endBlock: 184_718,
    blocks: [
      { index: 184_715, hash: "0x9d5e...f1a4", difficulty: 5, status: "valid" },
      { index: 184_716, hash: "0xae6f...02b5", difficulty: 5, status: "valid" },
      { index: 184_717, hash: "0xbf70...13c6", difficulty: 5, status: "valid" },
    ],
    isValid: true,
    createdBy: "honest_node_23",
    timestamp: Date.now() - 1800_000,
  },
];
