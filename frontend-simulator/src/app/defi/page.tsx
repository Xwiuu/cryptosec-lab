"use client";

import { BarChart3, DollarSign, TrendingDown, Activity, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { WarningCallout } from "@/components/ui/WarningCallout";
import { SecurityNotice } from "@/components/ui/SecurityNotice";
import { defiOverview, defiPools, defiRisks } from "@/data/defi";

type DefiPoolRow = (typeof defiPools)[number];

const poolColumns: Column<DefiPoolRow>[] = [
  { key: "name", label: "Pool" },
  { key: "protocol", label: "Protocol", render: (p) => <span className="text-xs text-[var(--color-text-secondary)]">{p.protocol}</span> },
  { key: "tvl", label: "TVL", render: (p) => <span className="text-xs font-mono">${(p.tvl / 1_000_000).toFixed(1)}M</span> },
  { key: "healthFactor", label: "Health", render: (p) => p.healthFactor > 0 ? <span className={`text-xs font-mono ${p.healthFactor < 1.5 ? "text-[var(--color-accent-red)]" : p.healthFactor < 2 ? "text-[var(--color-accent-amber)]" : "text-[var(--color-accent-green)]"}`}>{p.healthFactor.toFixed(2)}</span> : <span className="text-xs text-[var(--color-text-muted)]">-</span> },
  { key: "oracleStatus", label: "Oracle", render: (p) => <span className={`text-xs ${p.oracleStatus === "healthy" ? "text-[var(--color-accent-green)]" : p.oracleStatus === "manipulated" ? "text-[var(--color-accent-red)]" : p.oracleStatus === "stale" ? "text-[var(--color-accent-amber)]" : "text-[var(--color-accent-red)]"}`}>{p.oracleStatus}</span> },
  { key: "riskScore", label: "Risk", render: (p) => <SeverityBadge severity={p.riskScore >= 80 ? "critical" : p.riskScore >= 50 ? "high" : p.riskScore >= 30 ? "medium" : "low"} /> },
];

export default function DefiPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="DeFi Overview" description="Protocol solvency, oracle health, and liquidation risk" icon={BarChart3} />
      <SecurityNotice message="Local simulation only. No real funds, protocol positions, or mainnet connection are involved." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Total TVL" value={`$${(defiOverview.totalTVL / 1_000_000).toFixed(1)}M`} icon={DollarSign} />
        <MetricCard label="Total Borrowed" value={`$${(defiOverview.totalBorrowed / 1_000_000).toFixed(1)}M`} icon={TrendingDown} severity={defiOverview.totalBorrowed / defiOverview.totalCollateral > 0.6 ? "high" : "info"} />
        <MetricCard label="Bad Debt" value={`$${(defiOverview.badDebt / 1_000).toFixed(0)}K`} icon={AlertTriangle} severity={defiOverview.badDebt > 200_000 ? "high" : "medium"} />
        <MetricCard label="Liquidation Queue" value={defiOverview.liquidationQueue} icon={Activity} severity={defiOverview.liquidationQueue > 10 ? "high" : "info"} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Active Pools" value={defiOverview.activePools} />
        <MetricCard label="Avg Health Factor" value={defiOverview.averageHealthFactor.toFixed(2)} severity={defiOverview.averageHealthFactor < 1.5 ? "critical" : defiOverview.averageHealthFactor < 2 ? "high" : "info"} />
        <MetricCard label="Risk Score" value={defiOverview.riskScore} severity={defiOverview.riskScore >= 70 ? "critical" : defiOverview.riskScore >= 50 ? "high" : "medium"} />
        <MetricCard label="Total Collateral" value={`$${(defiOverview.totalCollateral / 1_000_000).toFixed(1)}M`} />
      </div>

      {defiRisks.filter(r => r.severity === "critical").length > 0 && (
        <WarningCallout title="Critical DeFi Risks Detected" description={defiRisks.filter(r => r.severity === "critical").map(r => r.name).join(", ")} type="critical" />
      )}

      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl">
        <div className="px-4 py-3 border-b border-[var(--color-border-primary)]"><h2 className="text-sm font-semibold text-[var(--color-text-primary)]">DeFi Pools</h2></div>
        <DataTable columns={poolColumns} data={defiPools} />
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Risk Analysis</h2>
        {defiRisks.map((risk) => (
          <div key={risk.id} className="p-3 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] flex items-start gap-3">
            <SeverityBadge severity={risk.severity} />
            <div>
              <span className="text-xs font-medium text-[var(--color-text-primary)]">{risk.name}</span>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{risk.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
