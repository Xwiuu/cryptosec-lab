"use client";

import { useState } from "react";
import { Timer, Gauge, Ban } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { WarningCallout } from "@/components/ui/WarningCallout";
import { SecurityNotice } from "@/components/ui/SecurityNotice";
import { ModeToggle } from "@/components/ui/ModeToggle";
import { AddressDisplay } from "@/components/ui/AddressDisplay";
import { HashDisplay } from "@/components/ui/HashDisplay";
import { pendingTransactions, mempoolSummary, mempoolProtectionRules } from "@/data/mempool";
import { useLabStore } from "@/store/labStore";

type PendingTransaction = (typeof pendingTransactions)[number];

const txColumns: Column<PendingTransaction>[] = [
  { key: "hash", label: "Hash", render: (t) => <HashDisplay hash={t.hash} /> },
  { key: "from", label: "From", render: (t) => <AddressDisplay address={t.from} chars={6} /> },
  { key: "to", label: "To", render: (t) => <AddressDisplay address={t.to} chars={6} /> },
  { key: "value", label: "Value", render: (t) => <span className="text-xs font-mono">{t.value}</span> },
  { key: "fee", label: "Fee", render: (t) => <span className="text-xs font-mono">{t.fee}</span> },
  { key: "gasPrice", label: "Gas", render: (t) => <span className="text-xs font-mono">{t.gasPrice}</span> },
  { key: "isReplay", label: "Replay", render: (t) => t.isReplay ? <SeverityBadge severity="critical" /> : <span className="text-xs text-[var(--color-text-muted)]">-</span> },
  { key: "isDoubleSpend", label: "Double", render: (t) => t.isDoubleSpend ? <SeverityBadge severity="critical" /> : <span className="text-xs text-[var(--color-text-muted)]">-</span> },
  { key: "status", label: "Status", render: (t) => <span className={`text-xs font-medium ${t.isValid ? "text-[var(--color-accent-green)]" : "text-[var(--color-accent-red)]"}`}>{t.isValid ? "Valid" : "Invalid"}</span> },
];

export default function MempoolPage() {
  const { simulationMode } = useLabStore();
  const [spamBurst, setSpamBurst] = useState(0);
  const hasIssues = pendingTransactions.some(t => t.isReplay || t.isDoubleSpend || !t.isValid);
  const acceptedSpam = simulationMode === "secure" ? Math.min(spamBurst, 2) : spamBurst;
  const rejectedSpam = simulationMode === "secure" ? Math.max(spamBurst - 2, 0) : 0;
  const pendingCount = mempoolSummary.totalPending + acceptedSpam;
  const spamCount = mempoolSummary.spamCount + acceptedSpam;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mempool Monitor"
        description="Pending transactions and mempool security"
        icon={Timer}
        actions={<ModeToggle />}
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <MetricCard label="Pending TXs" value={pendingCount} severity={pendingCount > 20 ? "high" : "info"} />
        <MetricCard label="Unique Senders" value={mempoolSummary.uniqueSenders} />
        <MetricCard label="Total Fees" value={mempoolSummary.totalFees} icon={Gauge} />
        <MetricCard label="Avg Gas Price" value={mempoolSummary.avgGasPrice} />
        <MetricCard label="Spam TXs" value={spamCount} severity={spamCount > 0 ? "critical" : "low"} />
      </div>

      {hasIssues && (
        <WarningCallout
          title="Mempool Threats Detected"
          description={`${mempoolSummary.replayCount} replay transaction(s), ${mempoolSummary.doubleSpendCount} double-spend attempt(s), ${mempoolSummary.invalidSignatureCount} invalid signature(s) found.`}
          type="critical"
        />
      )}

      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl">
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[var(--color-border-primary)]">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Pending Transactions</h2>
          <button
            onClick={() => setSpamBurst((count) => count + 10)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-accent-amber)]/30 bg-[var(--color-accent-amber-bg)] px-3 py-1.5 text-xs font-medium text-[var(--color-accent-amber)] transition-colors hover:bg-[var(--color-accent-amber)]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-amber)]"
          >
            <Ban className="h-3.5 w-3.5" />
            Simulate Spam
          </button>
        </div>
        <DataTable columns={txColumns} data={pendingTransactions} />
      </div>

      {spamBurst > 0 && (
        <div className={`rounded-xl border p-3 ${simulationMode === "secure" ? "border-[var(--color-accent-green)]/30 bg-[var(--color-accent-green-bg)]" : "border-[var(--color-accent-red)]/30 bg-[var(--color-accent-red-bg)]"}`}>
          <p className={`text-xs font-medium ${simulationMode === "secure" ? "text-[var(--color-accent-green)]" : "text-[var(--color-accent-red)]"}`}>
            {simulationMode === "secure"
              ? `${rejectedSpam} spam transaction(s) rejected by local fee and per-address limits.`
              : `${acceptedSpam} spam transaction(s) accepted into the vulnerable local mempool.`}
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl p-4">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">Protection Rules</h2>
          <div className="space-y-3">
            {Object.entries(mempoolProtectionRules).map(([rule, values]) => (
              <div key={rule} className="flex items-center justify-between p-2 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)]">
                <span className="text-xs text-[var(--color-text-secondary)] capitalize">{rule.replace(/([A-Z])/g, " $1")}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${!values.vulnerable ? "text-[var(--color-accent-red)]" : "text-[var(--color-text-muted)]"}`}>
                    Vuln: {values.vulnerable?.toString() || "false"}
                  </span>
                  <span className={`text-xs ${values.secure ? "text-[var(--color-accent-green)]" : "text-[var(--color-text-muted)]"}`}>
                    Secure: {values.secure?.toString() || "false"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl p-4">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">Mempool Status</h2>
          <div className="space-y-2">
            <div className="flex justify-between"><span className="text-xs text-[var(--color-text-muted)]">Protection Mode</span><span className={`text-xs font-medium ${simulationMode === "secure" ? "text-[var(--color-accent-green)]" : "text-[var(--color-accent-red)]"}`}>{simulationMode === "secure" ? "Secure" : "Vulnerable"}</span></div>
            <div className="flex justify-between"><span className="text-xs text-[var(--color-text-muted)]">Min Fee</span><span className="text-xs font-mono text-[var(--color-text-secondary)]">{mempoolProtectionRules.minFee[simulationMode]} ETH</span></div>
            <div className="flex justify-between"><span className="text-xs text-[var(--color-text-muted)]">Max TX/Address</span><span className="text-xs font-mono text-[var(--color-text-secondary)]">{mempoolProtectionRules.maxTxPerAddress[simulationMode]}</span></div>
            <div className="flex justify-between"><span className="text-xs text-[var(--color-text-muted)]">Deduplication</span><span className={`text-xs ${mempoolProtectionRules.deduplicationEnabled[simulationMode] ? "text-[var(--color-accent-green)]" : "text-[var(--color-accent-red)]"}`}>{mempoolProtectionRules.deduplicationEnabled[simulationMode] ? "Enabled" : "Disabled"}</span></div>
          </div>
        </div>
      </div>

      <SecurityNotice message="Local simulation only. No real funds. No mainnet connection. No real transactions are monitored or broadcast." />
    </div>
  );
}
