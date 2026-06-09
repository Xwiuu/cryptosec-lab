"use client";

import { useState } from "react";
import { DollarSign, Shield } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { WarningCallout } from "@/components/ui/WarningCallout";
import { ModeToggle } from "@/components/ui/ModeToggle";
import { SecurityNotice } from "@/components/ui/SecurityNotice";
import { stablecoinState, stablecoinRisks, circuitBreakerState } from "@/data/stablecoin";
import { useLabStore } from "@/store/labStore";

export default function StablecoinPage() {
  const { simulationMode } = useLabStore();
  const [simulateDepeg, setSimulateDepeg] = useState(false);
  const [mintAttempted, setMintAttempted] = useState(false);

  const currentRatio = simulateDepeg ? 105 : stablecoinState.collateralRatio;
  const currentPrice = simulateDepeg ? 0.85 : stablecoinState.currentPrice;
  const circuitBreakerActive = simulationMode === "secure" && currentRatio < circuitBreakerState.minCollateralRatio;

  return (
    <div className="space-y-6">
      <PageHeader title="Stablecoin Lab" description="Simulate collateralized stablecoin and depeg events" icon={DollarSign} actions={<ModeToggle />} />
      <SecurityNotice message="Local simulation only. No real funds, minting, redemption, collateral, or mainnet connection are involved." />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <MetricCard label="Total Supply" value={`${(stablecoinState.totalSupply / 1_000_000).toFixed(0)}M ${stablecoinState.symbol}`} />
        <MetricCard label="Collateral Value" value={`$${(stablecoinState.collateralValue / 1_000_000).toFixed(1)}M`} />
        <MetricCard label="Collateral Ratio" value={`${currentRatio}%`} severity={currentRatio < 120 ? "critical" : currentRatio < 150 ? "high" : "low"} />
        <MetricCard label="Price" value={`$${currentPrice.toFixed(2)}`} severity={currentPrice < 0.95 ? "critical" : currentPrice < 0.99 ? "high" : "low"} />
        <MetricCard label="Deviation" value={`${((currentPrice - 1) * 100).toFixed(1)}%`} severity={Math.abs(currentPrice - 1) > 0.05 ? "critical" : Math.abs(currentPrice - 1) > 0.01 ? "high" : "low"} />
      </div>

      {currentPrice < 0.99 && (
        <WarningCallout title={`Depeg Event: ${stablecoinState.symbol} trading at $${currentPrice.toFixed(2)}`} description={`${((1 - currentPrice) * 100).toFixed(1)}% below peg. Collateral ratio at ${currentRatio}%. Risk of cascading liquidation.`} type="critical" />
      )}

      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Collateral Ratio Simulation</h2>
          <button onClick={() => { setSimulateDepeg(!simulateDepeg); setMintAttempted(false); }} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--color-accent-red-bg)] text-[var(--color-accent-red)] border border-[var(--color-accent-red)]/30 hover:bg-red-500/20 transition-colors">
            {simulateDepeg ? "Reset" : "Simulate Collateral Crash"}
          </button>
        </div>
        <div>
          <div className="flex justify-between mb-1"><span className="text-xs text-[var(--color-text-muted)]">Current Ratio</span><span className={`text-xs font-mono ${currentRatio < 120 ? "text-[var(--color-accent-red)]" : currentRatio < 150 ? "text-[var(--color-accent-amber)]" : "text-[var(--color-accent-green)]"}`}>{currentRatio}%</span></div>
          <div className="h-4 bg-[var(--color-bg-primary)] rounded-full overflow-hidden relative">
            <div className={`h-full rounded-full transition-all ${currentRatio < 120 ? "bg-[var(--color-accent-red)]" : currentRatio < 150 ? "bg-[var(--color-accent-amber)]" : "bg-[var(--color-accent-green)]"}`} style={{ width: `${Math.min(currentRatio, 200)}%` }} />
            <div className="absolute top-0 bottom-0 left-[120%] w-0.5 bg-[var(--color-accent-red)]" style={{ left: "120%" }} />
          </div>
          <div className="flex justify-between text-[10px] text-[var(--color-text-muted)] mt-1">
            <span>Min: 120%</span>
            <span>Target: 150%</span>
          </div>
        </div>
        {simulateDepeg && (
          <div className="p-3 rounded-lg bg-[var(--color-accent-red-bg)] border border-[var(--color-accent-red)]/20">
            <p className="text-xs text-[var(--color-accent-red)]">Collateral value dropped 30%. Ratio now at 105%. Minting halted. Circuit breaker should trigger.</p>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Risk Analysis</h2>
          {stablecoinRisks.map((risk) => (
            <div key={risk.id} className={`p-3 rounded-xl bg-[var(--color-bg-card)] border ${risk.active ? "border-[var(--color-border-primary)]" : "border-[var(--color-border-primary)] opacity-50"}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-[var(--color-text-primary)]">{risk.name}</span>
                {risk.active && <SeverityBadge severity={risk.severity} />}
              </div>
              <p className="text-xs text-[var(--color-text-muted)]">{risk.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl p-4 space-y-3">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Circuit Breaker</h2>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Status</span><span className={`font-medium ${circuitBreakerActive ? "text-[var(--color-accent-green)]" : "text-[var(--color-text-muted)]"}`}>{circuitBreakerActive ? "Active" : "Standby"}</span></div>
            <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Max Mint/Block</span><span className="font-mono text-[var(--color-text-secondary)]">{circuitBreakerState.maxMintPerBlock.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Min Collateral Ratio</span><span className="font-mono text-[var(--color-text-secondary)]">{circuitBreakerState.minCollateralRatio}%</span></div>
            <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Cooldown Period</span><span className="font-mono text-[var(--color-text-secondary)]">{circuitBreakerState.cooldownPeriod}s</span></div>
            <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Last Triggered</span><span className="font-mono text-[var(--color-text-secondary)]">{circuitBreakerState.lastTriggered || "Never"}</span></div>
          </div>
          {simulationMode === "secure" && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--color-accent-green-bg)] border border-[var(--color-accent-green)]/30">
              <Shield className="w-3.5 h-3.5 text-[var(--color-accent-green)]" />
              <span className="text-[10px] text-[var(--color-accent-green)]">Over-collateralized & circuit breaker enabled</span>
            </div>
          )}
          <button
            onClick={() => setMintAttempted(true)}
            className="w-full rounded-lg border border-[var(--color-accent-blue)]/30 bg-[var(--color-accent-blue-bg)] px-3 py-2 text-xs font-medium text-[var(--color-accent-blue)] transition-colors hover:bg-[var(--color-accent-blue)]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-blue)]"
          >
            Attempt Mock Mint
          </button>
          {mintAttempted && (
            <div className={`rounded-lg border p-2 ${circuitBreakerActive ? "border-[var(--color-accent-green)]/30 bg-[var(--color-accent-green-bg)]" : "border-[var(--color-accent-amber)]/30 bg-[var(--color-accent-amber-bg)]"}`}>
              <p className={`text-[10px] ${circuitBreakerActive ? "text-[var(--color-accent-green)]" : "text-[var(--color-accent-amber)]"}`}>
                {circuitBreakerActive ? "Mint blocked by secure circuit breaker." : "Mock mint accepted in current simulation state."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
