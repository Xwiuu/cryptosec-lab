"use client";

import { LabRunTimeline } from "@/components/admin/LabRunTimeline";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { PlayCircle, ShieldCheck, Zap, Activity } from "lucide-react";
import { mockLabRuns } from "@/data/admin";

export default function AdminLabRuns() {
  const totalRuns = mockLabRuns.length;
  const successRate = Math.round(
    (mockLabRuns.filter((r) => r.success).length / totalRuns) * 100
  );
  const avgGas = Math.round(
    mockLabRuns.reduce((acc, r) => acc + r.gasUsed, 0) / totalRuns
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Lab Attacks & Exploits</h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse recent exploit runs and defensive simulations executed in the playground.
          </p>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-md transition-colors">
          <PlayCircle className="w-3.5 h-3.5" />
          Run Simulation
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AdminMetricCard
          title="Simulations Run"
          value={totalRuns}
          icon={Activity}
          description="Exploits triggered"
        />
        <AdminMetricCard
          title="Exploit Success Rate"
          value={`${successRate}%`}
          icon={Zap}
          iconColor="text-rose-400 bg-rose-500/10 border-rose-500/20"
          description="Vulnerability exploit effectiveness"
        />
        <AdminMetricCard
          title="Avg Gas Used"
          value={avgGas.toLocaleString()}
          icon={ShieldCheck}
          iconColor="text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
          description="Average transaction gas cost"
        />
      </div>

      {/* Lab runs list */}
      <div className="bg-[#111118] border border-white/5 p-6 rounded-xl">
        <LabRunTimeline />
      </div>
    </div>
  );
}
