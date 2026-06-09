export const scannerSummary = {
  totalFindings: 156,
  criticalCount: 12,
  highCount: 34,
  mediumCount: 58,
  lowCount: 42,
  infoCount: 10,
  rulesActive: 48,
  rulesTotal: 60,
  lastScan: Date.now() - 1800_000,
  scanDuration: 12.4,
  filesScanned: 47,
};

export const scannerFindings = [
  { id: "SF-001", title: "Reentrancy: Unchecked external call in withdraw()", description: "The withdraw function makes an external call before updating state, allowing reentrancy.", severity: "critical" as const, category: "smart_contract", file: "contracts/src/VulnerableBank.sol", line: 42, snippet: "(bool ok,) = msg.sender.call{value: amount}(\"\");", recommendation: "Use Checks-Effects-Interactions pattern. Update balances before calling external contracts.", confidence: "high" as const, status: "open" as const, rule: "RE-001" },
  { id: "SF-002", title: "Unprotected mint function", description: "mint() lacks access control. Any address can mint new tokens.", severity: "critical" as const, category: "smart_contract", file: "contracts/src/VulnerableToken.sol", line: 23, snippet: "function mint(address to, uint amount) external {", recommendation: "Add onlyOwner modifier or equivalent access control to mint().", confidence: "high" as const, status: "open" as const, rule: "AC-001" },
  { id: "SF-003", title: "Weak hash: Block hash used for randomness", description: "Block hash and timestamp used as entropy source. Validator can manipulate.", severity: "high" as const, category: "smart_contract", file: "contracts/src/VulnerableRandomness.sol", line: 8, snippet: "return uint(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender)));", recommendation: "Use a verifiable randomness source like Chainlink VRF.", confidence: "high" as const, status: "open" as const, rule: "BR-001" },
  { id: "SF-004", title: "Difficulty bypass: Low nonce accepted", description: "Block accepted with nonce=0, bypassing proof-of-work difficulty.", severity: "critical" as const, category: "protocol", file: "vulnerable-chain/src/difficulty_bypass.rs", line: 15, snippet: "fn validate_pow(hash: &str, difficulty: u32) -> bool { true }", recommendation: "Implement proper PoW validation checking leading zeros requirement.", confidence: "high" as const, status: "open" as const, rule: "DB-001" },
  { id: "SF-005", title: "Oracle price manipulation risk", description: "Oracle returns spot price without manipulation check. Flash loan can manipulate price.", severity: "critical" as const, category: "defi", file: "contracts/src/VulnerableOracle.sol", line: 56, snippet: "function getPrice(address token) external view returns (uint) { return prices[token]; }", recommendation: "Use TWAP oracle with manipulation-resistant pricing.", confidence: "medium" as const, status: "open" as const, rule: "OM-001" },
  { id: "SF-006", title: "No slippage protection in swap", description: "swap() function does not enforce minimum amountOut. Sandwich attack possible.", severity: "high" as const, category: "dex", file: "contracts/src/VulnerableAMM.sol", line: 87, snippet: "function swap(uint amountIn) external {", recommendation: "Add amountOutMin parameter and deadline to swap function.", confidence: "high" as const, status: "open" as const, rule: "SP-001" },
  { id: "SF-007", title: "Timestamp manipulation in lottery", description: "Block.timestamp used for randomness. Validator can influence outcome.", severity: "medium" as const, category: "smart_contract", file: "contracts/src/VulnerableRandomness.sol", line: 5, snippet: "block.timestamp", recommendation: "Avoid using block.timestamp for randomness or critical logic.", confidence: "high" as const, status: "accepted_risk" as const, rule: "TM-001" },
  { id: "SF-008", title: "Unprotected upgradeTo function", description: "Proxy upgrade function has no access control. Anyone can change implementation.", severity: "critical" as const, category: "smart_contract", file: "contracts/src/VulnerableUpgradeable.sol", line: 3, snippet: "function upgradeTo(address newImpl) external {", recommendation: "Add onlyOwner modifier to upgradeTo function.", confidence: "high" as const, status: "open" as const, rule: "UR-001" },
  { id: "SF-009", title: "Flash loan attack vector in lending", description: "Lending pool allows flash loan without proper oracle validation.", severity: "high" as const, category: "defi", file: "contracts/src/VulnerableLending.sol", line: 112, snippet: "function flashLoan(address token, uint amount) external {", recommendation: "Validate oracle price before and after flash loan execution.", confidence: "medium" as const, status: "open" as const, rule: "FL-001" },
  { id: "SF-010", title: "Bridge message replay vulnerability", description: "Bridge messages lack unique nonce per chain_id. Cross-chain replay possible.", severity: "critical" as const, category: "bridge", file: "contracts/src/VulnerableBridge.sol", line: 34, snippet: "function processMessage(bytes memory msg, bytes[] memory sigs) external {", recommendation: "Include chain_id and nonce in signed message. Track processed messages.", confidence: "high" as const, status: "open" as const, rule: "BR-002" },
];

export const scannerRules = [
  { id: "RE-001", name: "Reentrancy Detection", description: "Detects external calls before state updates", severity: "critical" as const, category: "smart_contract", isActive: true },
  { id: "AC-001", name: "Access Control Check", description: "Detects missing access controls on critical functions", severity: "critical" as const, category: "smart_contract", isActive: true },
  { id: "BR-001", name: "Bad Randomness", description: "Detects block.timestamp/prevrandao as entropy", severity: "high" as const, category: "smart_contract", isActive: true },
  { id: "DB-001", name: "Difficulty Bypass", description: "Detects PoW validation bypass", severity: "critical" as const, category: "protocol", isActive: true },
  { id: "OM-001", name: "Oracle Manipulation", description: "Detects spot price oracle usage", severity: "critical" as const, category: "defi", isActive: true },
  { id: "SP-001", name: "Slippage Protection", description: "Detects missing amountOutMin checks", severity: "high" as const, category: "dex", isActive: true },
  { id: "TM-001", name: "Timestamp Manipulation", description: "Detects timestamp-based logic", severity: "medium" as const, category: "smart_contract", isActive: true },
  { id: "UR-001", name: "Upgradeability Risk", description: "Detects unprotected upgrade functions", severity: "critical" as const, category: "smart_contract", isActive: true },
  { id: "FL-001", name: "Flash Loan Risk", description: "Detects flash loan without price validation", severity: "high" as const, category: "defi", isActive: true },
  { id: "BR-002", name: "Bridge Replay", description: "Detects missing domain separator in bridge", severity: "critical" as const, category: "bridge", isActive: true },
];
