"use client";

import { Coins, TrendingUp, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { SecurityNotice } from "@/components/ui/SecurityNotice";
import { AddressDisplay } from "@/components/ui/AddressDisplay";
import { tokensData } from "@/data/tokens";

type TransferRow = (typeof tokensData.transfers)[number];

const transferColumns: Column<TransferRow>[] = [
  { key: "from", label: "From", render: (t) => <AddressDisplay address={t.from} chars={8} /> },
  { key: "to", label: "To", render: (t) => <AddressDisplay address={t.to} chars={8} /> },
  { key: "amount", label: "Amount", render: (t) => <span className="text-xs font-mono">{t.amount.toLocaleString()} CSEC</span> },
  { key: "timestamp", label: "Time", render: (t) => <span className="text-xs text-[var(--color-text-muted)]">{new Date(t.timestamp).toLocaleString()}</span> },
];

export default function TokensPage() {
  const { overview, supplyBreakdown, tokenRisks } = tokensData;
  return (
    <div className="space-y-6">
      <PageHeader title="Token / Altcoin Lab" description="Simulate tokenomics, mint/burn, and approval risks" icon={Coins} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Price" value={`$${overview.price}`} icon={TrendingUp} />
        <MetricCard label="Market Cap" value={`$${(overview.marketCap / 1_000_000).toFixed(1)}M`} />
        <MetricCard label="Holders" value={overview.holders.toLocaleString()} icon={Users} />
        <MetricCard label="Supply" value={`${(overview.circulatingSupply / 1_000_000).toFixed(1)}M / ${(overview.totalSupply / 1_000_000).toFixed(1)}M`} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl p-4">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">Supply Distribution</h2>
          <div className="space-y-3">
            {supplyBreakdown.map((item) => (
              <div key={item.name}>
                <div className="flex justify-between mb-1"><span className="text-xs text-[var(--color-text-secondary)]">{item.name}</span><span className="text-xs text-[var(--color-text-muted)]">{item.percentage}%</span></div>
                <div className="h-2 bg-[var(--color-bg-primary)] rounded-full overflow-hidden"><div className="h-full bg-[var(--color-accent-blue)] rounded-full" style={{ width: `${item.percentage}%` }} /></div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Token Risks</h2>
          {tokenRisks.map((risk) => (
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

      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl">
        <div className="px-4 py-3 border-b border-[var(--color-border-primary)]">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Recent Transfers</h2>
        </div>
        <DataTable columns={transferColumns} data={tokensData.transfers} />
      </div>

      <SecurityNotice message="Local simulation only. No real funds, token transfers, or mainnet connection are involved." />
    </div>
  );
}
