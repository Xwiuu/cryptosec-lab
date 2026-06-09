import { Project, Scan, Finding, Report, Client, LabRun } from "../types/admin";

export const mockProjects: Project[] = [
  {
    id: "p1",
    name: "YieldV2 Vaults",
    client: "Demo Yield Farm",
    status: "In Review",
    riskScore: 78,
    findingsCount: { critical: 1, high: 2, medium: 4, low: 2, info: 1 },
    startDate: "2026-06-01",
    repoUrl: "github.com/demo-yield-farm/yield-v2",
    description: "Audit of new auto-compounding vault strategies and reward distribution tokens."
  },
  {
    id: "p2",
    name: "BridgeCore",
    client: "Demo Bridge",
    status: "Findings Ready",
    riskScore: 92,
    findingsCount: { critical: 3, high: 1, medium: 2, low: 0, info: 0 },
    startDate: "2026-05-15",
    repoUrl: "github.com/demo-bridge/bridge-core",
    description: "Security review of cross-chain message relayers and native wrapped asset validators."
  },
  {
    id: "p3",
    name: "DEX Aggregator",
    client: "Demo DEX",
    status: "Fixing",
    riskScore: 45,
    findingsCount: { critical: 0, high: 2, medium: 3, low: 5, info: 2 },
    startDate: "2026-05-20",
    repoUrl: "github.com/demo-dex/aggregator",
    description: "Audit of trade routing algorithms and gas-optimized multi-hop swaps."
  },
  {
    id: "p4",
    name: "StablePeg Collateral",
    client: "Demo Stablecoin",
    status: "Completed",
    riskScore: 12,
    findingsCount: { critical: 0, high: 0, medium: 1, low: 3, info: 5 },
    startDate: "2026-04-10",
    endDate: "2026-05-01",
    repoUrl: "github.com/demo-stable/collateral-vault",
    description: "Review of stablecoin stability module and liquidation trigger mechanics."
  }
];

export const mockScans: Scan[] = [
  {
    id: "sc-1",
    project: "YieldV2 Vaults",
    timestamp: "2026-06-09T18:30:00Z",
    scannerType: "Static Analysis (Rust Scanner)",
    rulesTriggered: 7,
    filesScanned: 14,
    durationSeconds: 12.4,
    status: "Warnings",
    findings: 4
  },
  {
    id: "sc-2",
    project: "BridgeCore",
    timestamp: "2026-06-08T10:15:00Z",
    scannerType: "Fuzzing & Invariant (Foundry)",
    rulesTriggered: 18,
    filesScanned: 8,
    durationSeconds: 245.0,
    status: "Failed",
    findings: 6
  },
  {
    id: "sc-3",
    project: "DEX Aggregator",
    timestamp: "2026-06-07T14:20:00Z",
    scannerType: "Static Analysis (Rust Scanner)",
    rulesTriggered: 3,
    filesScanned: 22,
    durationSeconds: 18.2,
    status: "Passed",
    findings: 0
  },
  {
    id: "sc-4",
    project: "StablePeg Collateral",
    timestamp: "2026-06-05T09:00:00Z",
    scannerType: "Formal Verification (Simulated)",
    rulesTriggered: 0,
    filesScanned: 5,
    durationSeconds: 1800.0,
    status: "Passed",
    findings: 0
  }
];

export const mockFindings: Finding[] = [
  {
    id: "f-1",
    title: "Read-only Reentrancy in Curve pricing method",
    description: "The vault queries the Curve pool price before updating the pool's state, leading to temporary price manipulation vulnerabilities.",
    severity: "critical",
    status: "Open",
    category: "Reentrancy",
    impact: "An attacker could manipulate pool balances and withdraw inflated shares from the vault in a single transaction.",
    mitigation: "Use a nonReentrant lock on the viewing functions or use a TWAP/Chainlink oracle instead of spot price.",
    detectedIn: "CurvePriceOracle.sol"
  },
  {
    id: "f-2",
    title: "Unchecked ERC20 transfer return values",
    description: "Several functions in the Vault logic call transfer() without checking the return boolean.",
    severity: "high",
    status: "Open",
    category: "Token Accounting",
    impact: "Tokens that fail to transfer silently will still grant shares to depositors.",
    mitigation: "Use SafeERC20's safeTransfer and safeTransferFrom wrapper methods.",
    detectedIn: "VaultStorage.sol"
  },
  {
    id: "f-3",
    title: "EIP-712 Domain Separator replay vulnerability",
    description: "The implementation contract stores DOMAIN_SEPARATOR as an immutable state variable rather than computing it dynamically.",
    severity: "medium",
    status: "Ready for Retest",
    category: "Cryptography",
    impact: "If the chain forks, signed permits can be replayed on both chains.",
    mitigation: "Compute DOMAIN_SEPARATOR dynamically in the permit function, or recompute it if block.chainid changes.",
    detectedIn: "PermitToken.sol"
  },
  {
    id: "f-4",
    title: "Uninitialized proxy implementation contract",
    description: "The logic/implementation contract is not initialized during deployment.",
    severity: "critical",
    status: "In Fix",
    category: "Proxy Collision",
    impact: "An attacker can initialize the logic contract, become owner, and call selfdestruct, bricking all proxy contracts.",
    mitigation: "Add an initializer modifier or call _disableInitializers() in the constructor of the logic contract.",
    detectedIn: "LendingPoolImplementation.sol"
  },
  {
    id: "f-5",
    title: "Rounding precision loss leading to dust accumulation",
    description: "The division happens before multiplication in share calculation.",
    severity: "low",
    status: "Retest Passed",
    category: "Arithmetic",
    impact: "Minor loss of funds (dust) in edge case redemptions.",
    mitigation: "Always perform multiplications before divisions when doing integer math in Solidity.",
    detectedIn: "YieldOptimizer.sol"
  }
];

export const mockReports: Report[] = [
  {
    id: "rep-1",
    projectName: "YieldV2 Vaults",
    version: "v1.0-draft",
    status: "Draft",
    lastUpdated: "2026-06-08"
  },
  {
    id: "rep-2",
    projectName: "BridgeCore",
    version: "v1.1-review",
    status: "Internal Review",
    lastUpdated: "2026-06-09"
  },
  {
    id: "rep-3",
    projectName: "DEX Aggregator",
    version: "v2.0-sent",
    status: "Sent to Client",
    lastUpdated: "2026-06-05"
  },
  {
    id: "rep-4",
    projectName: "StablePeg Collateral",
    version: "v1.0-final",
    status: "Final",
    lastUpdated: "2026-05-01",
    downloadUrl: "#"
  }
];

export const mockClients: Client[] = [
  {
    id: "cl-1",
    name: "Demo Yield Farm",
    industry: "Yield Aggregator",
    status: "Active",
    riskScore: 54,
    auditsCompleted: 2
  },
  {
    id: "cl-2",
    name: "Demo DEX",
    industry: "Decentralized Exchange",
    status: "Active",
    riskScore: 32,
    auditsCompleted: 4
  },
  {
    id: "cl-3",
    name: "Demo Bridge",
    industry: "Cross-Chain Relayer",
    status: "Active",
    riskScore: 88,
    auditsCompleted: 1
  },
  {
    id: "cl-4",
    name: "Demo Stablecoin",
    industry: "Algorithmic Stablecoin",
    status: "Active",
    riskScore: 15,
    auditsCompleted: 3
  }
];

export const mockLabRuns: LabRun[] = [
  {
    id: "lr-1",
    scenarioName: "Reentrancy Drain Simulation",
    timestamp: "2026-06-09T18:45:00Z",
    attackType: "Reentrancy",
    gasUsed: 142000,
    stolenAmount: "45.0 ETH",
    txHash: "0x8fa12b9d7e48cf3b2a5e8d83d1c4f5a9b2c8a77d12f4581c81d3f9e9a4f210d3",
    success: true
  },
  {
    id: "lr-2",
    scenarioName: "Oracle Price Manipulation Simulation",
    timestamp: "2026-06-09T16:20:00Z",
    attackType: "Oracle",
    gasUsed: 98000,
    stolenAmount: "120,000 USDC",
    txHash: "0x3c2bea4fa9156b823e20e3a47fd3f56b27e8a91b2c4d8e7b9a5c81d3f9e210da",
    success: true
  },
  {
    id: "lr-3",
    scenarioName: "Bridge Signature Replay Simulation",
    timestamp: "2026-06-08T11:05:00Z",
    attackType: "Bridge",
    gasUsed: 215000,
    stolenAmount: "30.0 ETH",
    txHash: "0x7d2e44a1b8c2d3a90f12c3b4e9f7a81c2d34a56b78c9d0e1f2a3b4c5d6e7f8a9",
    success: false
  },
  {
    id: "lr-4",
    scenarioName: "DAO Proposal Hijack Simulation",
    timestamp: "2026-06-07T15:30:00Z",
    attackType: "DAO",
    gasUsed: 350000,
    stolenAmount: "1,500,000 GOV",
    txHash: "0xf4e287bc12a90f12c3b4e9f7a81c2d34a56b78c9d0e1f2a3b4c5d6e7f8a9b0c1",
    success: true
  }
];
