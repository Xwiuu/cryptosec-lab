export const dashboardMetrics = {
  totalBlocks: 184_723,
  totalTransactions: 892_451,
  pendingTransactions: 23,
  activeValidators: 47,
  totalVulnerabilitiesSimulated: 22,
  smartContractsAnalyzed: 14,
  scannerFindings: 156,
  criticalFindings: 12,
  highFindings: 34,
  totalTestsPassed: 1_247,
  lastBlock: "0x7f3a...b9e2",
  networkUptime: 99.97,
  averageBlockTime: 2.3,
  currentEpoch: 142,
  totalStaked: 2_847_000,
  circulatingSupply: 10_000_000,
  marketCap: 47_200_000,
};

export const systemOverviewCards = [
  { label: "Total Blocks", value: "184,723", change: "+12.4%", icon: "Layers" },
  { label: "Total TXs", value: "892,451", change: "+8.2%", icon: "ArrowLeftRight" },
  { label: "Pending TXs", value: "23", change: "-3.1%", icon: "Clock" },
  { label: "Active Validators", value: "47", change: "+2", icon: "Server" },
  { label: "Vulnerabilities", value: "22", change: "All simulated", icon: "ShieldAlert" },
  { label: "Scanner Findings", value: "156", change: "12 critical", icon: "Search" },
];

export const recentFindings = [
  { id: "F-001", title: "Reentrancy in withdraw()", severity: "critical", file: "VulnerableBank.sol", line: 42, status: "open", category: "smart_contract" },
  { id: "F-002", title: "Unchecked external call", severity: "high", file: "VulnerableAMM.sol", line: 87, status: "open", category: "defi" },
  { id: "F-003", title: "Weak hash collision", severity: "critical", file: "weak_hash.rs", line: 15, status: "open", category: "protocol" },
  { id: "F-004", title: "Missing access control", severity: "high", file: "VulnerableToken.sol", line: 23, status: "fixed", category: "smart_contract" },
  { id: "F-005", title: "Oracle price manipulation", severity: "critical", file: "VulnerableOracle.sol", line: 56, status: "open", category: "defi" },
  { id: "F-006", title: "Flash loan attack vector", severity: "high", file: "VulnerableLending.sol", line: 112, status: "open", category: "defi" },
  { id: "F-007", title: "Timestamp dependence", severity: "medium", file: "VulnerableRandomness.sol", line: 8, status: "accepted_risk", category: "smart_contract" },
  { id: "F-008", title: "Front-running vulnerability", severity: "high", file: "VulnerableDEX.sol", line: 34, status: "open", category: "dex" },
];

export const attackTimeline = [
  { id: "A-001", name: "Reentrancy Attack", target: "VulnerableBank", severity: "critical", timestamp: "2024-12-01T10:00:00Z", status: "simulated", block: 182_400 },
  { id: "A-002", name: "Sandwich Attack", target: "VulnerableAMM", severity: "high", timestamp: "2024-12-02T14:30:00Z", status: "simulated", block: 182_750 },
  { id: "A-003", name: "51% Attack", target: "VulnerableChain", severity: "critical", timestamp: "2024-12-03T09:15:00Z", status: "simulated", block: 183_100 },
  { id: "A-004", name: "Flash Loan Attack", target: "VulnerableLending", severity: "critical", timestamp: "2024-12-04T16:45:00Z", status: "simulated", block: 183_450 },
  { id: "A-005", name: "Governance Attack", target: "VulnerableDAO", severity: "high", timestamp: "2024-12-05T11:00:00Z", status: "simulated", block: 183_800 },
  { id: "A-006", name: "Bridge Replay Attack", target: "VulnerableBridge", severity: "critical", timestamp: "2024-12-06T08:30:00Z", status: "simulated", block: 184_150 },
];

export const vulnerabilityCoverage = {
  total: 22,
  covered: 18,
  inProgress: 3,
  notCovered: 1,
  categories: [
    { name: "Protocol", total: 5, covered: 4 },
    { name: "Smart Contract", total: 6, covered: 5 },
    { name: "DeFi", total: 5, covered: 4 },
    { name: "DEX", total: 2, covered: 2 },
    { name: "DAO", total: 1, covered: 1 },
    { name: "NFT", total: 1, covered: 1 },
    { name: "Bridge", total: 1, covered: 1 },
    { name: "Wallet", total: 1, covered: 0 },
  ],
};

export const testCoverage = {
  total: 139,
  passed: 1247,
  failed: 0,
  rustTests: 128,
  foundryTests: 11,
};
