"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { SecurityNotice } from "@/components/ui/SecurityNotice";

const vulnerabilities = [
  { id: "V-001", name: "Weak Hash", description: "Hash function with insufficient collision resistance allows block forgery.", severity: "critical", category: "protocol", preCondition: "Weak hash algorithm (e.g., truncated SHA-1)", attack: "Generate collision for target block hash. Produce valid hash for tampered block.", impact: "Chain integrity compromised. Invalid blocks accepted as valid.", mitigation: "Use SHA-256 or Blake3 with full output.", testReference: "weak_hash.rs tests" },
  { id: "V-002", name: "Difficulty Bypass", description: "PoW validation returns true for any nonce, bypassing mining difficulty.", severity: "critical", category: "protocol", preCondition: "PoW validation function always returns true", attack: "Submit block with nonce=0. Block accepted without valid proof-of-work.", impact: "Anyone can mine blocks. No computational cost. Chain spamming possible.", mitigation: "Implement proper leading-zero validation on block hash.", testReference: "difficulty_bypass.rs tests" },
  { id: "V-003", name: "Replay Attack", description: "Valid signed transaction replayed to execute twice.", severity: "critical", category: "protocol", preCondition: "No nonce or unique identifier per transaction", attack: "Capture valid signed transaction. Re-submit to network. Executed again.", impact: "Double execution of transfers. Unauthorized balance changes.", mitigation: "Include unique nonce per sender. Track processed nonces.", testReference: "replay_attack.rs tests" },
  { id: "V-004", name: "Double Spend", description: "Same funds spent twice by broadcasting conflicting transactions.", severity: "critical", category: "protocol", preCondition: "No mempool conflict detection or 0-conf acceptance", attack: "Create two conflicting transactions with same UTXO. Broadcast to different nodes.", impact: "Recipient accepts payment that is later invalidated. Vendor loses funds.", mitigation: "Wait for sufficient confirmations. Use mempool conflict detection.", testReference: "double_spend.rs tests" },
  { id: "V-005", name: "Invalid Signature", description: "Transaction with forged or invalid signature accepted.", severity: "critical", category: "protocol", preCondition: "Signature verification skipped or incorrectly implemented", attack: "Submit transaction with arbitrary signature field. Node accepts without verification.", impact: "Anyone can transfer funds from any address. Complete loss of fund security.", mitigation: "Always verify ed25519 or ECDSA signature before processing transaction.", testReference: "invalid_signature.rs tests" },
  { id: "V-006", name: "Timestamp Manipulation", description: "Validator manipulates block timestamp to influence logic.", severity: "high", category: "protocol", preCondition: "Smart contract uses block.timestamp for critical logic", attack: "Validator sets future/past timestamp. Triggers time-dependent conditions early/late.", impact: "Lottery outcomes predicted. Time-locks bypassed. Interest calculations manipulated.", mitigation: "Use block number instead of timestamp for logic. Enforce timestamp bounds.", testReference: "timestamp_manipulation.rs tests" },
  { id: "V-007", name: "Chain Tampering", description: "Block content modified after acceptance without detection.", severity: "critical", category: "protocol", preCondition: "No chain validation on block receipt", attack: "Modify transaction in accepted block. Propagate modified chain.", impact: "Historical transactions altered. Chain state diverges from canonical.", mitigation: "Validate each block's hash and previous_hash on receipt. Use longest chain rule.", testReference: "chain_tampering.rs tests" },
  { id: "V-008", name: "Mempool Spam", description: "Network flooded with low-fee or invalid transactions.", severity: "medium", category: "protocol", preCondition: "No minimum fee or per-address limits in mempool", attack: "Submit thousands of low-fee transactions. Fill mempool capacity.", impact: "Legitimate transactions delayed or dropped. Network congestion.", mitigation: "Enforce minimum fee. Limit transactions per address. Use dynamic fee market.", testReference: "mempool_spam.rs tests" },
  { id: "V-009", name: "Overflow / Underflow", description: "Arithmetic overflow/underflow in balances or calculations.", severity: "high", category: "smart_contract", preCondition: "No SafeMath or checked arithmetic", attack: "Deposit minimal amount. Trigger underflow to inflate balance.", impact: "Attacker gains enormous balance. Protocol insolvency.", mitigation: "Use Solidity 0.8+ built-in checked arithmetic. Use SafeMath for older versions.", testReference: "OverflowUnderflowTest.t.sol" },
  { id: "V-010", name: "51% Attack", description: "Attacker controls majority of hashing power or stake.", severity: "critical", category: "protocol", preCondition: "Single entity controls >50% of network hash rate or stake", attack: "Mine private longer chain. Broadcast to reorganize honest chain. Double-spend.", impact: "Chain reorganization. Double-spend executed. Network trust destroyed.", mitigation: "High total hash rate/stake. Decentralized validator set. Fast finality.", testReference: "fifty_one_percent.rs tests" },
  { id: "V-011", name: "Reentrancy", description: "External call re-enters caller before state update.", severity: "critical", category: "smart_contract", preCondition: "State updated after external call (CEI violation)", attack: "Deploy attacker contract with fallback. Call victim withdraw(). Fallback re-enters.", impact: "Complete drain of contract funds.", mitigation: "Checks-Effects-Interactions pattern. Reentrancy guard.", testReference: "ReentrancyTest.t.sol" },
  { id: "V-012", name: "Access Control", description: "Critical function lacks permission check.", severity: "critical", category: "smart_contract", preCondition: "No onlyOwner or role-based modifier on sensitive function", attack: "Call mint/withdraw/upgrade function directly. Execute privileged action.", impact: "Unlimited minting. Fund theft. Contract self-destruct.", mitigation: "Add access control modifiers. Use OpenZeppelin Ownable.", testReference: "AccessControlTest.t.sol" },
  { id: "V-013", name: "Bad Randomness", description: "On-chain predictable randomness used for gambling/lottery.", severity: "high", category: "smart_contract", preCondition: "block.timestamp, prevrandao, or blockhash used as entropy", attack: "Pre-compute random value in same block. Submit winning entry.", impact: "Lottery/raffle outcomes predicted. Funds unfairly won.", mitigation: "Use Chainlink VRF. Commit-reveal scheme. Oracle-based randomness.", testReference: "BadRandomnessTest.t.sol" },
  { id: "V-014", name: "Oracle Manipulation", description: "Spot price oracle manipulated via flash loans.", severity: "critical", category: "defi", preCondition: "Oracle returns spot price without TWAP", attack: "Flash loan large amount. Swap to manipulate pool price. Trigger liquidation at false price.", impact: "Unfair liquidations. Protocol bad debt. Attacker profit at protocol expense.", mitigation: "Use TWAP oracle. Multiple price sources. Manipulation-resistant feeds.", testReference: "OracleManipulationTest.t.sol" },
  { id: "V-015", name: "Flash Loan Attack", description: "Uncollateralized loan used to exploit protocol logic.", severity: "critical", category: "defi", preCondition: "Protocol assumes no large price movements within single block", attack: "Borrow via flash loan. Manipulate price. Exploit arbitrage/liquidation. Repay loan.", impact: "Protocol drained. Bad debt created. Price manipulation.", mitigation: "Validate price across blocks. Use TWAP. Implement circuit breakers.", testReference: "FlashLoanTest.t.sol" },
  { id: "V-016", name: "Sandwich Attack", description: "MEV: transaction sandwiched between attacker's buy and sell.", severity: "high", category: "dex", preCondition: "No slippage protection. Public mempool.", attack: "Detect large pending swap. Place buy order before, sell order after victim.", impact: "Victim gets worse price. Attacker profits from price movement.", mitigation: "Use amountOutMin. Private mempool/RPC. Batch auctions.", testReference: "SandwichAttackTest.t.sol" },
  { id: "V-017", name: "Governance Attack", description: "Flash loan used to pass malicious proposal.", severity: "critical", category: "dao", preCondition: "No snapshot voting. Low quorum.", attack: "Flash loan governance tokens. Vote on malicious proposal. Execute treasury drain.", impact: "Treasury drained. Protocol parameters changed maliciously.", mitigation: "Snapshot-based voting. Meaningful quorum. Timelock on execution.", testReference: "GovernanceTest.t.sol" },
  { id: "V-018", name: "Approval Abuse", description: "Unlimited token approval exploited by malicious contract.", severity: "high", category: "wallet", preCondition: "User grants infinite approval without limit", attack: "Compromise approved contract. Drain all approved tokens from user.", impact: "Complete loss of approved tokens.", mitigation: "Use limited approvals. Revoke unused approvals. Monitor approval events.", testReference: "ApprovalTest.t.sol" },
  { id: "V-019", name: "Upgradeability Risk", description: "Proxy upgrade function without access control.", severity: "critical", category: "smart_contract", preCondition: "upgradeTo() has no onlyOwner modifier", attack: "Call upgradeTo() with malicious implementation. delegatecall executes attacker code.", impact: "Complete contract takeover. All funds drained.", mitigation: "OnlyOwner on upgrade. Timelock on upgrades. Multi-sig governance.", testReference: "UpgradeabilityTest.t.sol" },
  { id: "V-020", name: "Bridge Replay", description: "Cross-chain message replayed on target chain.", severity: "critical", category: "bridge", preCondition: "No domain separator (chain_id) in signed message", attack: "Capture valid bridge message. Replay on different chain. Mint wrapped tokens again.", impact: "Unlimited minting of wrapped assets. Bridge insolvency.", mitigation: "Include chain_id and nonce in signed message. Track processed messages.", testReference: "BridgeReplayTest.t.sol" },
  { id: "V-021", name: "Stablecoin Depeg", description: "Stablecoin loses peg due to collateral insufficiency.", severity: "critical", category: "defi", preCondition: "Under-collateralized. Oracle lag.", attack: "Manipulate collateral price. Trigger cascading liquidations. Break peg.", impact: "Stablecoin trades below peg. User funds lost. Protocol insolvent.", mitigation: "Over-collateralization. Circuit breakers. Gradual liquidation.", testReference: "StablecoinTest.t.sol" },
  { id: "V-022", name: "Liquidation Attack", description: "Oracle manipulation triggers unfair liquidations.", severity: "high", category: "defi", preCondition: "Oracle price can be manipulated within single block", attack: "Depress oracle price. Liquidate healthy positions at discount. Profit.", impact: "Users unfairly liquidated. Protocol gains bad reputation.", mitigation: "TWAP oracle. Liquidation delay. Max liquidation percentage.", testReference: "LiquidationTest.t.sol" },
];

const categories = ["all", "protocol", "wallet", "smart_contract", "defi", "dex", "dao", "nft", "bridge", "operational"] as const;
const severities = ["all", "critical", "high", "medium", "low"] as const;

export default function VulnerabilitiesPage() {
  const [sevFilter, setSevFilter] = useState("all");
  const [catFilter, setCatFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = vulnerabilities.filter(v => (sevFilter === "all" || v.severity === sevFilter) && (catFilter === "all" || v.category === catFilter));

  return (
    <div className="space-y-6">
      <PageHeader title="Vulnerability Playground" description="Complete catalog of simulated blockchain and smart contract vulnerabilities" icon={ShieldAlert} />

      <div className="flex flex-wrap gap-2">
        {severities.map(s => (
          <button key={s} onClick={() => setSevFilter(s)} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${sevFilter === s ? "bg-[var(--color-accent-blue)] text-white" : "bg-[var(--color-bg-card)] text-[var(--color-text-muted)] border border-[var(--color-border-primary)] hover:border-[var(--color-accent-blue)]/50"}`}>
            {s === "all" ? "All Severities" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map(c => (
          <button key={c} onClick={() => setCatFilter(c)} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${catFilter === c ? "bg-[var(--color-bg-card)] border border-[var(--color-accent-blue)] text-[var(--color-text-primary)]" : "bg-[var(--color-bg-card)] text-[var(--color-text-muted)] border border-[var(--color-border-primary)] hover:border-[var(--color-accent-blue)]/50"}`}>
            {c === "all" ? "All Categories" : c.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((vuln) => (
          <motion.div key={vuln.id} layout className="bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl overflow-hidden">
            <button
              onClick={() => setExpanded(expanded === vuln.id ? null : vuln.id)}
              aria-expanded={expanded === vuln.id}
              className="w-full flex items-center justify-between p-4 hover:bg-[var(--color-bg-card-hover)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-blue)] focus-visible:ring-inset"
            >
              <div className="flex items-center gap-3">
                <SeverityBadge severity={vuln.severity} />
                <div className="text-left">
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">{vuln.name}</span>
                  <span className="text-xs text-[var(--color-text-muted)] ml-2">({vuln.category.replace("_", " ")})</span>
                </div>
              </div>
              {expanded === vuln.id ? <ChevronUp className="w-4 h-4 text-[var(--color-text-muted)]" /> : <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)]" />}
            </button>
            <AnimatePresence>
              {expanded === vuln.id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-[var(--color-border-primary)]">
                  <div className="p-4 space-y-4">
                    <p className="text-xs text-[var(--color-text-secondary)]">{vuln.description}</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="p-3 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)]">
                          <h4 className="text-[10px] font-semibold uppercase text-[var(--color-text-muted)] mb-1">Pre-condition</h4>
                          <p className="text-xs text-[var(--color-text-secondary)]">{vuln.preCondition}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-[var(--color-accent-red-bg)] border border-[var(--color-accent-red)]/20">
                          <h4 className="text-[10px] font-semibold uppercase text-[var(--color-accent-red)] mb-1">Attack</h4>
                          <p className="text-xs text-[var(--color-text-secondary)]">{vuln.attack}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="p-3 rounded-lg bg-[var(--color-accent-amber-bg)] border border-[var(--color-accent-amber)]/20">
                          <h4 className="text-[10px] font-semibold uppercase text-[var(--color-accent-amber)] mb-1">Impact</h4>
                          <p className="text-xs text-[var(--color-text-secondary)]">{vuln.impact}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-[var(--color-accent-green-bg)] border border-[var(--color-accent-green)]/20">
                          <h4 className="text-[10px] font-semibold uppercase text-[var(--color-accent-green)] mb-1">Mitigation</h4>
                          <p className="text-xs text-[var(--color-text-secondary)]">{vuln.mitigation}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-[var(--color-text-muted)]">
                      <BookOpen className="w-3 h-3" />
                      <span>Test: {vuln.testReference}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      <SecurityNotice message="Local simulation only. No mainnet connection. Educational lab exploits only; do not execute against third-party systems." />
    </div>
  );
}
