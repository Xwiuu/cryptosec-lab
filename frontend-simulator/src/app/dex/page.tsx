"use client";

import { useState } from "react";
import { ArrowLeftRight, Droplets, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { WarningCallout } from "@/components/ui/WarningCallout";
import { ModeToggle } from "@/components/ui/ModeToggle";
import { SecurityNotice } from "@/components/ui/SecurityNotice";
import { ammPools, dexOverview, dexRisks } from "@/data/dex";
import { useLabStore } from "@/store/labStore";

type AmmPoolRow = (typeof ammPools)[number];

const poolColumns: Column<AmmPoolRow>[] = [
  { key: "tokenA", label: "Pool", render: (p) => <span className="text-xs font-medium text-[var(--color-text-primary)]">{p.tokenA}/{p.tokenB}</span> },
  { key: "reserveA", label: "Reserve A", render: (p) => <span className="text-xs font-mono">{(p.reserveA).toLocaleString()}</span> },
  { key: "reserveB", label: "Reserve B", render: (p) => <span className="text-xs font-mono">{(p.reserveB).toLocaleString()}</span> },
  { key: "price", label: "Price", render: (p) => <span className="text-xs font-mono">{p.price.toFixed(6)}</span> },
  { key: "liquidity", label: "Liquidity", render: (p) => <span className="text-xs font-mono">${(p.liquidity / 1_000_000).toFixed(1)}M</span> },
  { key: "volume24h", label: "Vol 24h", render: (p) => <span className="text-xs font-mono">${(p.volume24h / 1_000_000).toFixed(1)}M</span> },
  { key: "fee", label: "Fee", render: (p) => <span className="text-xs font-mono">{p.fee * 100}%</span> },
];

export default function DexPage() {
  const { simulationMode } = useLabStore();
  const [selectedPool, setSelectedPool] = useState<AmmPoolRow>(ammPools[0]);
  const [swapAmount, setSwapAmount] = useState(1000);
  const [swapExecuted, setSwapExecuted] = useState(false);
  const [showSandwich, setShowSandwich] = useState(false);

  const pool = selectedPool || ammPools[0];
  const amountOut = swapAmount * pool.price * (1 - pool.fee);
  const priceImpact = ((swapAmount / pool.reserveA) * 100).toFixed(2);
  const reserveAAfterSwap = pool.reserveA + (swapExecuted ? swapAmount : 0);
  const reserveBAfterSwap = pool.reserveB - (swapExecuted ? amountOut : 0);

  return (
    <div className="space-y-6">
      <PageHeader title="DEX / AMM Simulator" description="Simulate swaps, liquidity, and sandwich attacks" icon={ArrowLeftRight} actions={<ModeToggle />} />
      <SecurityNotice message="Local simulation only. No real funds, swaps, approvals, or mainnet connection are involved." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Total Liquidity" value={`$${(dexOverview.totalLiquidity / 1_000_000).toFixed(1)}M`} icon={Droplets} />
        <MetricCard label="24h Volume" value={`$${(dexOverview.totalVolume24h / 1_000_000).toFixed(1)}M`} icon={TrendingUp} />
        <MetricCard label="Active Pools" value={dexOverview.activePools} />
        <MetricCard label="24h Swaps" value={dexOverview.totalSwaps24h.toLocaleString()} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl">
          <div className="px-4 py-3 border-b border-[var(--color-border-primary)]"><h2 className="text-sm font-semibold text-[var(--color-text-primary)]">AMM Pools</h2></div>
          <DataTable columns={poolColumns} data={ammPools} onRowClick={(poolRow) => { setSelectedPool(poolRow); setSwapExecuted(false); }} />
        </div>

        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl p-4 space-y-4">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Swap Simulator: {pool.tokenA} → {pool.tokenB}</h2>
          <div>
            <label htmlFor="swap-amount" className="text-xs text-[var(--color-text-muted)] mb-2 block">Amount In ({pool.tokenA})</label>
            <input id="swap-amount" type="range" min="10" max="100000" value={swapAmount} onChange={(e) => { setSwapAmount(Number(e.target.value)); setSwapExecuted(false); }} className="w-full accent-[var(--color-accent-blue)]" />
            <div className="flex justify-between text-xs text-[var(--color-text-muted)] mt-1"><span>{swapAmount.toLocaleString()} {pool.tokenA}</span></div>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Amount Out</span><span className="font-mono text-[var(--color-text-primary)]">{amountOut.toFixed(4)} {pool.tokenB}</span></div>
            <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Price Impact</span><span className={`font-mono ${Number(priceImpact) > 5 ? "text-[var(--color-accent-red)]" : Number(priceImpact) > 2 ? "text-[var(--color-accent-amber)]" : "text-[var(--color-accent-green)]"}`}>{priceImpact}%</span></div>
            <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Fee</span><span className="font-mono text-[var(--color-text-secondary)]">{pool.fee * 100}% ({(swapAmount * pool.fee).toFixed(2)} {pool.tokenA})</span></div>
            <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">k Invariant</span><span className="font-mono text-[var(--color-text-secondary)]">{(pool.reserveA * pool.reserveB).toExponential(3)}</span></div>
            <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Slippage Mode</span><span className={`text-xs font-medium ${simulationMode === "secure" ? "text-[var(--color-accent-green)]" : "text-[var(--color-accent-red)]"}`}>{simulationMode === "secure" ? "Protected (0.5% min)" : "No Protection (0%)"}</span></div>
          </div>
          <button
            onClick={() => setSwapExecuted(true)}
            className="inline-flex items-center justify-center rounded-lg bg-[var(--color-accent-blue)] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-blue)]"
          >
            Execute Mock Swap
          </button>
          {swapExecuted && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-lg border border-[var(--color-accent-blue)]/30 bg-[var(--color-accent-blue-bg)] p-3 text-xs">
              <div><span className="text-[var(--color-text-muted)]">Reserve {pool.tokenA}</span><span className="block font-mono text-[var(--color-text-primary)]">{reserveAAfterSwap.toLocaleString()}</span></div>
              <div><span className="text-[var(--color-text-muted)]">Reserve {pool.tokenB}</span><span className="block font-mono text-[var(--color-text-primary)]">{Math.max(reserveBAfterSwap, 0).toLocaleString()}</span></div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Sandwich Attack Simulation</h2>
          <button onClick={() => setShowSandwich(!showSandwich)} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--color-accent-red-bg)] text-[var(--color-accent-red)] border border-[var(--color-accent-red)]/30 hover:bg-red-500/20 transition-colors">
            {showSandwich ? "Reset" : "Simulate Sandwich"}
          </button>
        </div>
        {!showSandwich ? (
          <p className="text-xs text-[var(--color-text-muted)]">Click to simulate a sandwich attack on the {pool.tokenA}/{pool.tokenB} pool. When slippage is 0%, MEV bots can front-run and back-run swaps for profit.</p>
        ) : (
          <div className="space-y-3">
            <WarningCallout title="Sandwich Attack Executed" description={`MEV bot detected victim's swap of ${swapAmount} ${pool.tokenA}. Front-run: bought ${pool.tokenB} at lower price. Victim: executed at manipulated price. Back-run: sold at profit.`} type="critical" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-[var(--color-accent-red-bg)] border border-[var(--color-accent-red)]/20">
                <span className="text-[var(--color-text-muted)] block mb-1">Front-run</span>
                <span className="text-[var(--color-accent-red)] font-mono">+{Math.floor(swapAmount * 0.01)} {pool.tokenB}</span>
              </div>
              <div className="p-3 rounded-lg bg-[var(--color-accent-amber-bg)] border border-[var(--color-accent-amber)]/20">
                <span className="text-[var(--color-text-muted)] block mb-1">Victim</span>
                <span className="text-[var(--color-accent-amber)] font-mono">-{Math.floor(amountOut * 0.08)} {pool.tokenB}</span>
              </div>
              <div className="p-3 rounded-lg bg-[var(--color-accent-green-bg)] border border-[var(--color-accent-green)]/20">
                <span className="text-[var(--color-text-muted)] block mb-1">Bot Profit</span>
                <span className="text-[var(--color-accent-green)] font-mono">+{Math.floor(amountOut * 0.05)} {pool.tokenB}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {dexRisks.map((risk) => (
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
