"use client";

import { useState } from "react";
import { ShieldAlert, FileText, Database, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminSettings() {
  const [profile, setProfile] = useState("Standard DeFi");
  const [template, setTemplate] = useState("Detailed Technical");
  const [localnetOnly, setLocalnetOnly] = useState(true);
  const [mockingActive, setMockingActive] = useState(true);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Administrative Settings</h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure security assessment profiles, report generation templates, and simulation modes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Risk Profile Card */}
          <div className="p-5 rounded-xl border border-white/5 bg-[#111118] space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <Shield className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Risk Scoring Assessment Profile</h3>
            </div>
            <div className="space-y-3 text-xs">
              <p className="text-slate-400">
                Choose the methodology used to calculate the risk score (0-100%) for audited projects and protocols.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {["Standard DeFi", "Conservative Bridge", "L2 Scaling/Rollup"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setProfile(p)}
                    className={cn(
                      "p-3 rounded-lg border text-left transition-all",
                      profile === p
                        ? "bg-indigo-500/10 border-indigo-500/30 text-white"
                        : "bg-white/5 border-transparent text-slate-400 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <span className="block font-bold">{p}</span>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      {p === "Standard DeFi" && "Standard ERC20 & AMM weights"}
                      {p === "Conservative Bridge" && "Severe multisig & cross-chain weights"}
                      {p === "L2 Scaling/Rollup" && "Optimistic/ZK settlement weights"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Report Template Card */}
          <div className="p-5 rounded-xl border border-white/5 bg-[#111118] space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <FileText className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Report Export Template</h3>
            </div>
            <div className="space-y-3 text-xs">
              <p className="text-slate-400">
                Configure layout templates for compiling and exporting generated PDF vulnerability reports.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {["Detailed Technical", "Executive Summary", "Code Comments Only"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTemplate(t)}
                    className={cn(
                      "p-3 rounded-lg border text-left transition-all",
                      template === t
                        ? "bg-indigo-500/10 border-indigo-500/30 text-white"
                        : "bg-white/5 border-transparent text-slate-400 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <span className="block font-bold">{t}</span>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      {t === "Detailed Technical" && "Includes complete PoC code & fixes"}
                      {t === "Executive Summary" && "High level charts & severities overview"}
                      {t === "Code Comments Only" && "Direct inline code markdown outputs"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Simulation Switches */}
          <div className="p-5 rounded-xl border border-white/5 bg-[#111118] space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <Database className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Environment & Simulation Config</h3>
            </div>
            <div className="space-y-4 text-xs">
              {/* Local Simulation Switch */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#0a0a0f] border border-white/5">
                <div>
                  <h4 className="font-bold text-white">Enforce Local Simulation Only</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Prevent any RPC connection outside Anvil / local host network.
                  </p>
                </div>
                <button
                  onClick={() => setLocalnetOnly(!localnetOnly)}
                  className={cn(
                    "px-3 py-1.5 rounded font-bold transition-all",
                    localnetOnly
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  )}
                >
                  {localnetOnly ? "ACTIVE" : "INACTIVE"}
                </button>
              </div>

              {/* Mocking Switch */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#0a0a0f] border border-white/5">
                <div>
                  <h4 className="font-bold text-white">Database Mock Engine</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Fallback to local memory object array when real API service is offline.
                  </p>
                </div>
                <button
                  onClick={() => setMockingActive(!mockingActive)}
                  className={cn(
                    "px-3 py-1.5 rounded font-bold transition-all",
                    mockingActive
                      ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                      : "bg-slate-800 text-slate-400 border border-white/5"
                  )}
                >
                  {mockingActive ? "ON" : "OFF"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Info Box (1/3 width) */}
        <div className="space-y-6">
          <div className="p-5 rounded-xl border border-white/5 bg-[#111118] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Database Context</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              The Admin console currently reads mock records configured in memory. Future integrations can link this page directly to the Rust backend API scanner endpoints via Axum.
            </p>
            <div className="p-3.5 rounded-lg bg-rose-500/5 border border-rose-500/10 text-rose-400 text-xs flex gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Security Notice:</strong> All client names (Demo DEX, Demo Bridge) and reports are generated simulated assets. No real credentials, wallets, or mainnet API calls are present.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
