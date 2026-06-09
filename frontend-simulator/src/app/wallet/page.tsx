"use client";

import { Wallet, Eye, EyeOff, ShieldAlert, PenLine, PlusCircle } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { AddressDisplay } from "@/components/ui/AddressDisplay";
import { WarningCallout } from "@/components/ui/WarningCallout";
import { SecurityNotice } from "@/components/ui/SecurityNotice";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { demoWallet, seedPhraseDemo, walletActivities, walletRisks } from "@/data/wallet";

type ActivityRow = (typeof walletActivities)[number];

const activityColumns: Column<ActivityRow>[] = [
  { key: "type", label: "Type", render: (a) => <span className="text-xs capitalize text-[var(--color-text-primary)]">{a.type}</span> },
  { key: "hash", label: "Hash", render: (a) => <AddressDisplay address={a.hash} chars={10} /> },
  { key: "value", label: "Value", render: (a) => <span className="text-xs font-mono">{a.value} {a.token}</span> },
  { key: "to", label: "To", render: (a) => <AddressDisplay address={a.to} chars={8} /> },
  { key: "risk", label: "Risk", render: (a) => a.risk ? <SeverityBadge severity="high" /> : <span className="text-xs text-[var(--color-text-muted)]">-</span> },
  { key: "status", label: "Status", render: (a) => <span className={`text-xs ${a.status === "confirmed" ? "text-[var(--color-accent-green)]" : a.status === "failed" ? "text-[var(--color-accent-red)]" : "text-[var(--color-accent-amber)]"}`}>{a.status}</span> },
];

export default function WalletPage() {
  const [showSeed, setShowSeed] = useState(false);
  const [demoCreated, setDemoCreated] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [phishingWarning, setPhishingWarning] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader title="Wallet Simulator" description="Create and interact with simulated wallets" icon={Wallet} />
      <SecurityNotice message="Local simulation only. Demo seed — not a real wallet. No real funds. No mainnet connection." />

      <div className="grid md:grid-cols-3 gap-3">
        <MetricCard label="Balance" value={`${demoWallet.balance} ETH`} severity="info" />
        <MetricCard label="Tokens" value={demoWallet.tokens.length} />
        <MetricCard label="Risk Flags" value={demoWallet.riskFlags.length} severity={demoWallet.riskFlags.length > 0 ? "critical" : "low"} />
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <button
          onClick={() => setDemoCreated(true)}
          className="flex items-center gap-3 rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] p-4 text-left transition-colors hover:bg-[var(--color-bg-card-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-blue)]"
        >
          <PlusCircle className="h-5 w-5 text-[var(--color-accent-blue)]" />
          <span>
            <span className="block text-sm font-semibold text-[var(--color-text-primary)]">Create Demo Wallet</span>
            <span className="block text-xs text-[var(--color-text-muted)]">{demoCreated ? "Demo wallet active in local state." : "Generates a mock identity only."}</span>
          </span>
        </button>
        <button
          onClick={() => setSignature(`0x${"c5ec".repeat(16)}`)}
          className="flex items-center gap-3 rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] p-4 text-left transition-colors hover:bg-[var(--color-bg-card-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-blue)]"
        >
          <PenLine className="h-5 w-5 text-[var(--color-accent-green)]" />
          <span>
            <span className="block text-sm font-semibold text-[var(--color-text-primary)]">Sign Demo Message</span>
            <span className="block text-xs text-[var(--color-text-muted)]">{signature ? "Mock signature generated." : "No private key is used."}</span>
          </span>
        </button>
        <button
          onClick={() => setPhishingWarning(!phishingWarning)}
          className="flex items-center gap-3 rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] p-4 text-left transition-colors hover:bg-[var(--color-bg-card-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-red)]"
        >
          <ShieldAlert className="h-5 w-5 text-[var(--color-accent-red)]" />
          <span>
            <span className="block text-sm font-semibold text-[var(--color-text-primary)]">Phishing Simulation</span>
            <span className="block text-xs text-[var(--color-text-muted)]">{phishingWarning ? "Warning visible." : "Shows a local warning."}</span>
          </span>
        </button>
      </div>

      {signature && (
        <div className="rounded-xl border border-[var(--color-accent-green)]/30 bg-[var(--color-accent-green-bg)] p-3">
          <p className="text-xs font-medium text-[var(--color-accent-green)]">Mock signature generated for message: &quot;CryptoSec Lab local simulation&quot;</p>
          <p className="mt-1 break-all font-mono text-[10px] text-[var(--color-text-secondary)]">{signature}</p>
        </div>
      )}

      {phishingWarning && (
        <WarningCallout
          title="Phishing Simulation Warning"
          description="A malicious dApp requested a blind signature. This is a local warning only; no wallet, key, or external site is connected."
          type="critical"
        />
      )}

      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl p-4 space-y-3">
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Wallet Identity</h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between"><span className="text-xs text-[var(--color-text-muted)]">Address</span><AddressDisplay address={demoWallet.address} chars={12} showCopy /></div>
          <div className="flex items-center justify-between"><span className="text-xs text-[var(--color-text-muted)]">Algorithm</span><span className="text-xs font-mono text-[var(--color-text-secondary)]">{demoWallet.algorithm}</span></div>
          <div className="flex items-center justify-between"><span className="text-xs text-[var(--color-text-muted)]">Created</span><span className="text-xs text-[var(--color-text-secondary)]">{new Date(demoWallet.created).toLocaleDateString()}</span></div>
          <div className="flex items-center justify-between"><span className="text-xs text-[var(--color-text-muted)]">Balance</span><span className="text-xs font-mono text-[var(--color-text-secondary)]">{demoWallet.balance} ETH</span></div>
        </div>
      </div>

      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl">
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[var(--color-border-primary)]">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Seed Phrase (Demo)</h2>
          <button
            onClick={() => setShowSeed(!showSeed)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-primary)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-blue)]"
          >
            {showSeed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {showSeed ? "Hide Demo Seed" : "Reveal Demo Seed"}
          </button>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {seedPhraseDemo.words.map((word, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)]">
                <span className="text-[10px] text-[var(--color-text-muted)] w-4">{i + 1}</span>
                <span className="text-xs font-mono text-[var(--color-text-secondary)]">{showSeed ? word : "••••••"}</span>
              </div>
            ))}
          </div>
          <WarningCallout title="Demo Seed — Not a Real Wallet" description="This seed phrase is for educational demonstration only. Never use this or similar phrases with real funds." type="critical" />
        </div>
      </div>

      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl">
        <div className="px-4 py-3 border-b border-[var(--color-border-primary)]">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Activity</h2>
        </div>
        <DataTable columns={activityColumns} data={walletActivities} />
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {walletRisks.map((risk) => (
          <div key={risk.id} className="p-3 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-primary)]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-[var(--color-text-primary)]">{risk.name}</span>
              <SeverityBadge severity={risk.severity} />
            </div>
            <p className="text-xs text-[var(--color-text-muted)]">{risk.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
