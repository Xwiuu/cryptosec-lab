"use client";

import { useState } from "react";
import { GitCompareArrows, Shield, ArrowLeftRight, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { WarningCallout } from "@/components/ui/WarningCallout";
import { ModeToggle } from "@/components/ui/ModeToggle";
import { SecurityNotice } from "@/components/ui/SecurityNotice";
import { bridgeTransactions, bridgeValidators, bridgeRisks } from "@/data/bridge";
import { useLabStore } from "@/store/labStore";

type BridgeTransactionRow = (typeof bridgeTransactions)[number];
type BridgeValidatorRow = (typeof bridgeValidators)[number];

const txColumns: Column<BridgeTransactionRow>[] = [
  { key: "id", label: "ID", render: (t) => <span className="text-xs font-mono text-[var(--color-text-muted)]">{t.id}</span> },
  { key: "sourceChain", label: "Source", render: (t) => <span className="text-xs text-[var(--color-text-secondary)]">{t.sourceChain}</span> },
  { key: "targetChain", label: "Target", render: (t) => <span className="text-xs text-[var(--color-text-secondary)]">{t.targetChain}</span> },
  { key: "token", label: "Token", render: (t) => <span className="text-xs font-mono">{t.token}</span> },
  { key: "amount", label: "Amount", render: (t) => <span className="text-xs font-mono">{t.amount.toLocaleString()}</span> },
  { key: "direction", label: "Direction", render: (t) => <span className="text-xs">{t.direction.replace("_", " -> ")}</span> },
  { key: "status", label: "Status", render: (t) => <span className={`text-xs font-medium ${t.status === "confirmed" ? "text-[var(--color-accent-green)]" : t.status === "pending" ? "text-[var(--color-accent-amber)]" : "text-[var(--color-accent-red)]"}`}>{t.status}</span> },
  { key: "isReplay", label: "Replay", render: (t) => t.isReplay ? <SeverityBadge severity="critical" /> : <span className="text-xs text-[var(--color-text-muted)]">-</span> },
];

const valColumns: Column<BridgeValidatorRow>[] = [
  { key: "name", label: "Validator" },
  { key: "stake", label: "Stake", render: (v) => <span className="text-xs font-mono">{(v.stake).toLocaleString()} CSEC</span> },
  { key: "isActive", label: "Status", render: (v) => v.isActive ? <span className="text-xs text-[var(--color-accent-green)]">Active</span> : <span className="text-xs text-[var(--color-accent-red)]">Inactive</span> },
  { key: "isCompromised", label: "Compromised", render: (v) => v.isCompromised ? <SeverityBadge severity="critical" /> : <span className="text-xs text-[var(--color-accent-green)]">Safe</span> },
  { key: "signedMessages", label: "Signed", render: (v) => <span className="text-xs font-mono">{v.signedMessages.toLocaleString()}</span> },
];

export default function BridgePage() {
  const { simulationMode } = useLabStore();
  const [showReplay, setShowReplay] = useState(false);

  const replayCount = bridgeTransactions.filter(t => t.isReplay).length;
  const compromisedCount = bridgeValidators.filter(v => v.isCompromised).length;
  const replayBlocked = simulationMode === "secure" && showReplay;
  const effectiveReplayCount = replayCount + (showReplay && !replayBlocked ? 1 : 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Bridge Security" description="Cross-chain bridge simulation with lock/mint, burn/release and attacks" icon={GitCompareArrows} actions={<ModeToggle />} />
      <SecurityNotice message="Local simulation only. No real funds, validator signatures, bridge messages, or mainnet connection are involved." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Total Transfers" value={bridgeTransactions.length} icon={ArrowLeftRight} />
        <MetricCard label="Active Validators" value={`${bridgeValidators.filter(v => v.isActive).length}/${bridgeValidators.length}`} icon={Users} />
        <MetricCard label="Replay Detected" value={effectiveReplayCount} severity={effectiveReplayCount > 0 ? "critical" : "low"} />
        <MetricCard label="Compromised" value={compromisedCount} severity={compromisedCount > 0 ? "critical" : "low"} />
      </div>

      {compromisedCount > 0 && (
        <WarningCallout title="Validator Compromise Detected" description={`${compromisedCount} validator(s) flagged as compromised. ${replayCount} replay transaction(s) found. Bridge at risk.`} type="critical" />
      )}

      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl">
        <div className="px-4 py-3 border-b border-[var(--color-border-primary)]"><h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Bridge Transactions</h2></div>
        <DataTable columns={txColumns} data={bridgeTransactions} />
      </div>

      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl">
        <div className="px-4 py-3 border-b border-[var(--color-border-primary)]"><h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Validator Set</h2></div>
        <DataTable columns={valColumns} data={bridgeValidators} />
      </div>

      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Message Replay Simulator</h2>
          <button onClick={() => setShowReplay(!showReplay)} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--color-accent-red-bg)] text-[var(--color-accent-red)] border border-[var(--color-accent-red)]/30 hover:bg-red-500/20 transition-colors">
            {showReplay ? "Reset" : "Simulate Replay"}
          </button>
        </div>
        {!showReplay ? (
          <p className="text-xs text-[var(--color-text-muted)]">Click to simulate a cross-chain message replay attack. The same bridge message is replayed on the target chain due to missing domain separator (chain_id).</p>
        ) : (
          <div className="space-y-3">
            <WarningCallout
              title={replayBlocked ? "Bridge Replay Rejected" : "Bridge Message Replayed"}
              description={replayBlocked
                ? "Replay attempt reused the same nonce on a different chain. Secure mode rejected it with chain_id and processed message tracking."
                : "Transaction btx-1 (lock 50,000 CSEC on CryptoSec Localnet) was replayed as btx-4 on Ethereum Sim. Same nonce, different chain. Wrapped tokens minted twice."}
              type={replayBlocked ? "info" : "critical"}
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-[var(--color-accent-green-bg)] border border-[var(--color-accent-green)]/20"><span className="text-[var(--color-text-muted)] block mb-1">Original</span><span className="text-[var(--color-accent-green)] font-mono">btx-1 • 50,000 CSEC ✓</span></div>
              <div className="p-3 rounded-lg bg-[var(--color-accent-red-bg)] border border-[var(--color-accent-red)]/20"><span className="text-[var(--color-text-muted)] block mb-1">Replay</span><span className="text-[var(--color-accent-red)] font-mono">btx-4 • 50,000 CSEC ✗</span></div>
              <div className="p-3 rounded-lg bg-[var(--color-accent-amber-bg)] border border-[var(--color-accent-amber)]/20"><span className="text-[var(--color-text-muted)] block mb-1">Double Minted</span><span className="text-[var(--color-accent-amber)] font-mono">100,000 CSEC total</span></div>
            </div>
            {replayBlocked && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--color-accent-green-bg)] border border-[var(--color-accent-green)]/30">
                <Shield className="w-3.5 h-3.5 text-[var(--color-accent-green)]" />
                <span className="text-[10px] text-[var(--color-accent-green)]">Secure mode: nonce + chain_id + processed message tracking prevented the replay.</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        {bridgeRisks.map((risk) => (
          <div key={risk.id} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-primary)]">
            <SeverityBadge severity={risk.severity} />
            <div>
              <span className="text-xs font-medium text-[var(--color-text-primary)]">{risk.name}</span>
              <p className="text-xs text-[var(--color-text-muted)]">{risk.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
