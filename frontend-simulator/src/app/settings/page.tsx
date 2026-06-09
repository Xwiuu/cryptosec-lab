"use client";

import { useState } from "react";
import { Settings, RotateCcw, Shield, Database, BarChart3, Monitor } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { SecurityNotice } from "@/components/ui/SecurityNotice";
import { useLabStore } from "@/store/labStore";
import type { SimulationMode, RiskScoring, DataSource } from "@/store/labStore";

export default function SettingsPage() {
  const {
    simulationMode, setSimulationMode,
    riskScoring,
    dataSource,
    setRiskScoring,
    setDataSource,
    resetSimulation,
  } = useLabStore();
  const [resetMessage, setResetMessage] = useState(false);

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Lab Settings" description="Configure simulation parameters" icon={Settings} />

      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-[var(--color-accent-blue)]" />
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Simulation Mode</h2>
            <p className="text-xs text-[var(--color-text-muted)]">Switch between vulnerable, secure, or compare mode</p>
          </div>
        </div>
        <div className="flex gap-2">
          {(["vulnerable", "secure", "compare"] as SimulationMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setSimulationMode(mode)}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-all capitalize ${
                simulationMode === mode
                  ? mode === "vulnerable"
                    ? "bg-[var(--color-accent-red)] text-white"
                    : mode === "secure"
                    ? "bg-[var(--color-accent-green)] text-white"
                    : "bg-[var(--color-accent-blue)] text-white"
                  : "bg-[var(--color-bg-primary)] text-[var(--color-text-muted)] border border-[var(--color-border-primary)] hover:border-[var(--color-accent-blue)]/50"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-[var(--color-accent-amber)]" />
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Risk Scoring</h2>
            <p className="text-xs text-[var(--color-text-muted)]">Adjust risk scoring sensitivity</p>
          </div>
        </div>
        <div className="flex gap-2">
          {(["conservative", "balanced", "aggressive"] as RiskScoring[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setRiskScoring(mode)}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-all capitalize ${
                riskScoring === mode
                  ? "bg-[var(--color-accent-blue)] text-white"
                  : "bg-[var(--color-bg-primary)] text-[var(--color-text-muted)] border border-[var(--color-border-primary)] hover:border-[var(--color-accent-blue)]/50"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 text-[var(--color-accent-cyan)]" />
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Data Source</h2>
            <p className="text-xs text-[var(--color-text-muted)]">Select data source for simulations</p>
          </div>
        </div>
        <div className="flex gap-2">
          {(["mock", "local_api"] as DataSource[]).map((source) => (
            <button
              key={source}
              onClick={() => source === "mock" && setDataSource(source)}
              disabled={source === "local_api"}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-all capitalize ${
                dataSource === source
                  ? "bg-[var(--color-accent-blue)] text-white"
                  : "bg-[var(--color-bg-primary)] text-[var(--color-text-muted)] border border-[var(--color-border-primary)]"
              }`}
            >
              {source === "mock" ? "Mock Data" : "Local API (future)"}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-3">
          <Monitor className="w-5 h-5 text-[var(--color-text-muted)]" />
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Theme</h2>
            <p className="text-xs text-[var(--color-text-muted)]">Dark mode is the default theme</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-xs font-medium rounded-lg bg-[var(--color-accent-blue)] text-white">Dark</button>
          <button className="px-4 py-2 text-xs font-medium rounded-lg bg-[var(--color-bg-primary)] text-[var(--color-text-muted)] border border-[var(--color-border-primary)] opacity-50 cursor-not-allowed">System (coming soon)</button>
        </div>
      </div>

      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-3">
          <RotateCcw className="w-5 h-5 text-[var(--color-accent-red)]" />
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Reset Simulation</h2>
            <p className="text-xs text-[var(--color-text-muted)]">Reset all simulation data and configurations to default</p>
          </div>
        </div>
        <button
          onClick={() => {
            resetSimulation();
            setResetMessage(true);
            setTimeout(() => setResetMessage(false), 3000);
          }}
          className="px-4 py-2 text-xs font-medium rounded-lg bg-[var(--color-accent-red-bg)] text-[var(--color-accent-red)] border border-[var(--color-accent-red)]/30 hover:bg-red-500/20 transition-colors"
        >
          Reset All Simulation Data
        </button>
        {resetMessage && <p className="text-xs text-[var(--color-accent-green)]">Simulation reset to local defaults.</p>}
      </div>

      <SecurityNotice message="Local simulation only. No real funds. No mainnet connection. All settings remain local and no real keys are used." />
    </div>
  );
}
