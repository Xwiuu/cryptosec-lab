"use client";

import { useState } from "react";
import { Pickaxe, Server, Gauge } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { WarningCallout } from "@/components/ui/WarningCallout";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { SecurityNotice } from "@/components/ui/SecurityNotice";

const validators = [
  { name: "Validator Alpha", stake: 500_000, status: "active", slashed: false, commission: 5 },
  { name: "Validator Beta", stake: 450_000, status: "active", slashed: false, commission: 4 },
  { name: "Validator Gamma", stake: 380_000, status: "active", slashed: false, commission: 6 },
  { name: "Validator Delta", stake: 200_000, status: "syncing", slashed: false, commission: 3 },
  { name: "Attacker Node-01", stake: 100_000, status: "active", slashed: false, commission: 10 },
  { name: "Attacker Node-02", stake: 80_000, status: "active", slashed: false, commission: 12 },
];

type ValidatorRow = (typeof validators)[number];

const valColumns: Column<ValidatorRow>[] = [
  { key: "name", label: "Validator" },
  { key: "stake", label: "Stake", render: (v) => <span className="text-xs font-mono">{(v.stake).toLocaleString()} CSEC</span> },
  { key: "status", label: "Status", render: (v) => <span className={`text-xs ${v.status === "active" ? "text-[var(--color-accent-green)]" : v.status === "syncing" ? "text-[var(--color-accent-amber)]" : "text-[var(--color-accent-red)]"}`}>{v.status}</span> },
  { key: "slashed", label: "Slashed", render: (v) => v.slashed ? <SeverityBadge severity="critical" /> : <span className="text-xs text-[var(--color-text-muted)]">No</span> },
  { key: "commission", label: "Comm.", render: (v) => <span className="text-xs font-mono">{v.commission}%</span> },
];

const fiftyOnePercentSim = {
  honestHashrate: 45,
  attackerHashrate: 55,
  honestBlocks: 42,
  attackerBlocks: 58,
  riskLevel: "critical",
};

export default function MiningPage() {
  const [tab, setTab] = useState<"pow" | "pos">("pow");
  const [difficulty, setDifficulty] = useState(4);
  const [mining, setMining] = useState(false);
  const [nonce, setNonce] = useState(0);
  const [minedHash, setMinedHash] = useState<string | null>(null);
  const [bypassShown, setBypassShown] = useState(false);
  const [selectedVal, setSelectedVal] = useState<string | null>(null);
  const [slashedVal, setSlashedVal] = useState<string | null>(null);
  const [attackSim, setAttackSim] = useState(false);

  const startMining = () => {
    setMining(true);
    setMinedHash(null);
    setNonce(0);
    const interval = setInterval(() => {
      setNonce((n) => {
        if (n > 5000) {
          clearInterval(interval);
          setMining(false);
          const hash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
          setMinedHash("0x" + "0".repeat(difficulty) + hash.slice(difficulty));
          return n;
        }
        return n + Math.floor(Math.random() * 100) + 1;
      });
    }, 50);
    return () => clearInterval(interval);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Mining & Consensus" description="Simulate PoW, PoS, and consensus attacks" icon={Pickaxe} />
      <SecurityNotice message="Local simulation only. No mining, validator staking, or mainnet consensus action is performed." />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <MetricCard label="Network Hashrate" value="247 TH/s" icon={Gauge} />
        <MetricCard label="Active Validators" value={validators.filter(v => v.status === "active").length} icon={Server} />
        <MetricCard label="Current Epoch" value="142" />
      </div>

      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab("pow")} className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors ${tab === "pow" ? "bg-[var(--color-accent-blue)] text-white" : "bg-[var(--color-bg-card)] text-[var(--color-text-muted)] border border-[var(--color-border-primary)]"}`}>Proof of Work</button>
        <button onClick={() => setTab("pos")} className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors ${tab === "pos" ? "bg-[var(--color-accent-blue)] text-white" : "bg-[var(--color-bg-card)] text-[var(--color-text-muted)] border border-[var(--color-border-primary)]"}`}>Proof of Stake</button>
      </div>

      {tab === "pow" && (
        <div className="space-y-6">
          <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl p-4 space-y-4">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">PoW Simulator</h2>
            <div>
              <label htmlFor="pow-difficulty" className="text-xs text-[var(--color-text-muted)] mb-2 block">Difficulty: {difficulty}</label>
              <input id="pow-difficulty" type="range" min="1" max="10" value={difficulty} onChange={(e) => setDifficulty(Number(e.target.value))} className="w-full accent-[var(--color-accent-blue)]" />
              <div className="text-xs text-[var(--color-text-muted)] mt-1">Hash target: {"0".repeat(difficulty)}... (leading zeros required)</div>
            </div>
            <button onClick={startMining} disabled={mining} className="px-4 py-2 text-xs font-medium rounded-lg bg-[var(--color-accent-blue)] text-white hover:bg-blue-600 disabled:opacity-50 transition-colors">
              {mining ? "Mining..." : "Mine Block"}
            </button>
            {mining && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-[var(--color-accent-blue)] border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-mono text-[var(--color-accent-blue)]">Nonce: {nonce.toLocaleString()}</span>
              </div>
            )}
            {minedHash && (
              <div className="p-3 rounded-lg bg-[var(--color-accent-green-bg)] border border-[var(--color-accent-green)]/30">
                <p className="text-xs text-[var(--color-accent-green)] mb-1">Block Mined!</p>
                <p className="text-[10px] font-mono text-[var(--color-text-secondary)] break-all">{minedHash}</p>
              </div>
            )}
            <div className="border-t border-[var(--color-border-primary)] pt-4">
              <button onClick={() => setBypassShown(!bypassShown)} className="px-4 py-2 text-xs font-medium rounded-lg bg-[var(--color-accent-red-bg)] text-[var(--color-accent-red)] border border-[var(--color-accent-red)]/30 hover:bg-red-500/20 transition-colors">
                {bypassShown ? "Hide" : "Simulate Difficulty Bypass"}
              </button>
              {bypassShown && (
                <div className="mt-3 p-3 rounded-lg bg-[var(--color-accent-red-bg)] border border-[var(--color-accent-red)]/30">
                  <p className="text-xs text-[var(--color-accent-red)] mb-1">Difficulty Bypass Detected!</p>
                  <p className="text-[10px] font-mono text-[var(--color-text-secondary)] break-all">Block #184712 accepted with nonce=0, no leading zeros. PoW validation returned true without checking.</p>
                  <SeverityBadge severity="critical" className="mt-2" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === "pos" && (
        <div className="space-y-6">
          <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl">
            <div className="px-4 py-3 border-b border-[var(--color-border-primary)]">
              <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Validators</h2>
            </div>
            <DataTable columns={valColumns} data={validators} onRowClick={(v) => setSelectedVal(v.name)} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => selectedVal && setSlashedVal(selectedVal)} disabled={!selectedVal} className="px-4 py-2 text-xs font-medium rounded-lg bg-[var(--color-accent-red-bg)] text-[var(--color-accent-red)] border border-[var(--color-accent-red)]/30 hover:bg-red-500/20 disabled:opacity-50 transition-colors">
              Slash Validator
            </button>
          </div>
          {slashedVal && <WarningCallout title="Validator Slashed" description={`${slashedVal} has been slashed for malicious behavior. Stake forfeited.`} type="critical" />}
        </div>
      )}

      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl p-4 space-y-4">
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">51% Attack Simulation</h2>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between mb-1"><span className="text-xs text-[var(--color-accent-green)]">Honest Chain</span><span className="text-xs text-[var(--color-text-muted)]">{fiftyOnePercentSim.honestHashrate}% hashrate • {fiftyOnePercentSim.honestBlocks} blocks</span></div>
            <div className="h-3 bg-[var(--color-bg-primary)] rounded-full overflow-hidden"><div className="h-full bg-[var(--color-accent-green)] rounded-full transition-all" style={{ width: `${fiftyOnePercentSim.honestHashrate}%` }} /></div>
          </div>
          <div>
            <div className="flex justify-between mb-1"><span className="text-xs text-[var(--color-accent-red)]">Attacker Chain</span><span className="text-xs text-[var(--color-text-muted)]">{fiftyOnePercentSim.attackerHashrate}% hashrate • {fiftyOnePercentSim.attackerBlocks} blocks</span></div>
            <div className="h-3 bg-[var(--color-bg-primary)] rounded-full overflow-hidden"><div className="h-full bg-[var(--color-accent-red)] rounded-full transition-all" style={{ width: `${fiftyOnePercentSim.attackerHashrate}%` }} /></div>
          </div>
        </div>
        <button onClick={() => setAttackSim(!attackSim)} className="px-4 py-2 text-xs font-medium rounded-lg bg-[var(--color-accent-red-bg)] text-[var(--color-accent-red)] border border-[var(--color-accent-red)]/30 hover:bg-red-500/20 transition-colors">
          {attackSim ? "Reset" : "Simulate 51% Attack"}
        </button>
        {attackSim && (
          <WarningCallout title="51% Attack Successful" description="Attacker with 55% hashrate produced a longer chain. Honest blocks reorganized. Double-spend executed." type="critical" />
        )}
      </div>
    </div>
  );
}
