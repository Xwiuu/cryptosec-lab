"use client";

import { mockLabRuns } from "@/data/admin";
import { CheckCircle2, XCircle, Code, DollarSign, Cpu } from "lucide-react";
import { cn, shortenHash } from "@/lib/utils";

export function LabRunTimeline() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <Cpu className="w-4 h-4 text-indigo-400" />
        <h3 className="text-sm font-bold text-slate-200">Recent Lab Exploits & Simulations</h3>
      </div>

      <div className="relative border-l border-white/5 pl-5 ml-2.5 space-y-5">
        {mockLabRuns.map((run) => (
          <div key={run.id} className="relative group">
            {/* Timeline Dot */}
            <div className={cn(
              "absolute -left-[27.5px] top-1 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center bg-[#0a0a0f]",
              run.success
                ? "border-emerald-500 text-emerald-400"
                : "border-rose-500 text-rose-400"
            )}>
              <span className={cn("w-1 h-1 rounded-full", run.success ? "bg-emerald-500" : "bg-rose-500")} />
            </div>

            {/* Content Card */}
            <div className="p-4 rounded-xl border border-white/5 bg-[#111118]/80 hover:border-white/10 transition-colors shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-xs font-bold text-white">{run.scenarioName}</h4>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">
                    {run.attackType}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(run.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3 pt-2 border-t border-white/5 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-slate-500" />
                  <span>Gas: <strong className="text-slate-300 font-mono">{run.gasUsed.toLocaleString()}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                  <span>Impact: <strong className="text-rose-400 font-bold">{run.stolenAmount}</strong></span>
                </div>
                <div className="col-span-2 sm:col-span-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                  <span className="truncate">Tx: <strong className="text-slate-500 font-mono hover:text-slate-300 transition-colors cursor-pointer" title={run.txHash}>{shortenHash(run.txHash, 6)}</strong></span>
                </div>
              </div>

              {/* Status Banner */}
              <div className="mt-2.5 flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1">
                  {run.success ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-400 font-semibold">Exploit Successful</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5 text-rose-500" />
                      <span className="text-rose-400 font-semibold">Exploit Mitigated / Reverted</span>
                    </>
                  )}
                </div>
                <span className="text-slate-500 font-mono text-[9px]">ID: {run.id}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
