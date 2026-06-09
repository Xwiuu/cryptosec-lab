"use client";

import { useState } from "react";
import { HandCoins, DollarSign, TrendingUp, Shield } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { WarningCallout } from "@/components/ui/WarningCallout";
import { ModeToggle } from "@/components/ui/ModeToggle";
import { SecurityNotice } from "@/components/ui/SecurityNotice";
import { lendingPositions, lendingPoolInfo, oracleManipulationScenario } from "@/data/lending";
import { useLabStore } from "@/store/labStore";

type LendingPositionRow = (typeof lendingPositions)[number];

const positionColumns: Column<LendingPositionRow>[] = [
  { key: "user", label: "User", render: (p) => <span className="text-xs font-mono">{p.user}</span> },
  { key: "collateral", label: "Collateral", render: (p) => <span className="text-xs font-mono">${(p.collateral).toLocaleString()}</span> },
  { key: "borrowed", label: "Borrowed", render: (p) => <span className="text-xs font-mono">${(p.borrowed).toLocaleString()}</span> },
  { key: "healthFactor", label: "Health", render: (p) => (
    <span className={`text-xs font-mono ${p.healthFactor < 1.1 ? "text-[var(--color-accent-red)]" : p.healthFactor < 1.5 ? "text-[var(--color-accent-amber)]" : "text-[var(--color-accent-green)]"}`}>
      {p.healthFactor.toFixed(2)}
    </span>
  )},
  { key: "ltv", label: "LTV", render: (p) => <span className="text-xs font-mono">{p.ltv}%</span> },
  { key: "isLiquidatable", label: "Liquidatable", render: (p) => p.isLiquidatable ? <SeverityBadge severity="critical" /> : <span className="text-xs text-[var(--color-accent-green)]">Safe</span> },
];

export default function LendingPage() {
  const { simulationMode } = useLabStore();
  const [showOracleManip, setShowOracleManip] = useState(false);
  const [liquidationRun, setLiquidationRun] = useState(false);

  const liquidatableCount = lendingPositions.filter(p => p.isLiquidatable).length;
  const simulatedLiquidatable = showOracleManip ? liquidatableCount + oracleManipulationScenario.affectedPositions : liquidatableCount;

  return (
    <div className="space-y-6">
      <PageHeader title="Lending Pool Simulator" description="Deposit, borrow, and simulate liquidation risks" icon={HandCoins} actions={<ModeToggle />} />
      <SecurityNotice message="Local simulation only. No real funds, loans, collateral, or mainnet connection are involved." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Total Collateral" value={`$${(lendingPoolInfo.totalCollateral / 1_000_000).toFixed(1)}M`} icon={DollarSign} />
        <MetricCard label="Total Borrowed" value={`$${(lendingPoolInfo.totalBorrowed / 1_000_000).toFixed(1)}M`} />
        <MetricCard label="Available Liquidity" value={`$${(lendingPoolInfo.availableLiquidity / 1_000_000).toFixed(1)}M`} />
        <MetricCard label="Avg APY" value={`${lendingPoolInfo.averageApy}%`} icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Utilization" value={`${lendingPoolInfo.utilizationRate}%`} severity={lendingPoolInfo.utilizationRate > 80 ? "high" : "info"} />
        <MetricCard label="Liquidatable" value={simulatedLiquidatable} severity={simulatedLiquidatable > 0 ? "critical" : "low"} />
        <MetricCard label="Liquidation Bonus" value={`${lendingPoolInfo.liquidationBonus}%`} />
        <MetricCard label="Base Rate" value={`${lendingPoolInfo.baseRate}%`} />
      </div>

      {liquidatableCount > 0 && (
        <WarningCallout title="Positions at Risk" description={`${liquidatableCount} position(s) are under-collateralized and subject to liquidation. Health factor below 1.1.`} type="critical" />
      )}

      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl">
        <div className="px-4 py-3 border-b border-[var(--color-border-primary)]"><h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Lending Positions</h2></div>
        <DataTable columns={positionColumns} data={lendingPositions} />
      </div>

      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Oracle Manipulation Simulator</h2>
          <button onClick={() => { setShowOracleManip(!showOracleManip); setLiquidationRun(false); }} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--color-accent-red-bg)] text-[var(--color-accent-red)] border border-[var(--color-accent-red)]/30 hover:bg-red-500/20 transition-colors">
            {showOracleManip ? "Reset" : "Manipulate Oracle"}
          </button>
        </div>
        {showOracleManip ? (
          <div className="space-y-3">
            <WarningCallout title="Oracle Price Manipulated" description={`Price manipulated from $${oracleManipulationScenario.normalPrice} to $${oracleManipulationScenario.manipulatedPrice} (${oracleManipulationScenario.priceDeviation}% deviation).`} type="critical" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)]">
                <span className="text-[var(--color-text-muted)] block mb-1">Normal Price</span>
                <span className="text-[var(--color-text-primary)] font-mono">${oracleManipulationScenario.normalPrice}</span>
              </div>
              <div className="p-3 rounded-lg bg-[var(--color-accent-red-bg)] border border-[var(--color-accent-red)]/20">
                <span className="text-[var(--color-text-muted)] block mb-1">Manipulated</span>
                <span className="text-[var(--color-accent-red)] font-mono">${oracleManipulationScenario.manipulatedPrice}</span>
              </div>
              <div className="p-3 rounded-lg bg-[var(--color-accent-amber-bg)] border border-[var(--color-accent-amber)]/20">
                <span className="text-[var(--color-text-muted)] block mb-1">Exploitable Profit</span>
                <span className="text-[var(--color-accent-amber)] font-mono">${oracleManipulationScenario.exploitableProfit.toLocaleString()}</span>
              </div>
            </div>
            <p className="text-xs text-[var(--color-text-muted)]">{oracleManipulationScenario.affectedPositions} position(s) affected. Liquidation would trigger at false price.</p>
            <button
              onClick={() => setLiquidationRun(true)}
              className="rounded-lg border border-[var(--color-accent-amber)]/30 bg-[var(--color-accent-amber-bg)] px-3 py-1.5 text-xs font-medium text-[var(--color-accent-amber)] transition-colors hover:bg-[var(--color-accent-amber)]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-amber)]"
            >
              Simulate Liquidation
            </button>
            {liquidationRun && (
              <div className={`rounded-lg border p-3 ${simulationMode === "secure" ? "border-[var(--color-accent-green)]/30 bg-[var(--color-accent-green-bg)]" : "border-[var(--color-accent-red)]/30 bg-[var(--color-accent-red-bg)]"}`}>
                <p className={`text-xs font-medium ${simulationMode === "secure" ? "text-[var(--color-accent-green)]" : "text-[var(--color-accent-red)]"}`}>
                  {simulationMode === "secure"
                    ? "Liquidation delayed: TWAP and max liquidation percentage prevented an unfair liquidation."
                    : "Liquidation executed against positions that only became unhealthy under the manipulated spot price."}
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-[var(--color-text-muted)]">Click to simulate oracle price manipulation. In vulnerable mode, a flash loan can manipulate the oracle price and trigger unfair liquidations.</p>
        )}
      </div>

      {simulationMode === "secure" && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-[var(--color-accent-green-bg)] border border-[var(--color-accent-green)]/30">
          <Shield className="w-4 h-4 text-[var(--color-accent-green)]" />
          <span className="text-xs text-[var(--color-accent-green)]">Secure mode active: TWAP oracle, liquidation delay, and max liquidation percentage enforced.</span>
        </div>
      )}
    </div>
  );
}
