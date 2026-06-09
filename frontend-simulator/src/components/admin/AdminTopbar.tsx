"use client";

import { Menu, ShieldAlert, Cpu, CheckCircle } from "lucide-react";
import { mockFindings, mockProjects } from "@/data/admin";

export function AdminTopbar({ onMenuClick }: { onMenuClick: () => void }) {
  const activeReviews = mockProjects.filter((p) => p.status !== "Completed").length;
  const criticalFindings = mockFindings.filter((f) => f.severity === "critical").length;
  const openFindings = mockFindings.filter((f) => f.status === "Open").length;

  return (
    <header className="sticky top-0 z-20 h-14 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
      <div className="flex items-center h-full px-4 gap-4">
        <button
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-white/5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
        >
          <Menu className="w-4 h-4 text-slate-400" />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-xs font-semibold text-indigo-300 whitespace-nowrap">
              Security Operations Center
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3 ml-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <Cpu className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-300">
              Active Reviews: <strong className="text-white">{activeReviews}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-xs text-rose-300">
              Critical Findings: <strong className="text-white">{criticalFindings}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <span className="text-xs text-amber-300">
              Open Alerts: <strong className="text-white">{openFindings}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs text-emerald-300 font-medium">Compliance OK</span>
          </div>
        </div>
      </div>
    </header>
  );
}
