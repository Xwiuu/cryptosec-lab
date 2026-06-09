"use client";

import { useState } from "react";
import { Finding, FindingStatus, FindingSeverity } from "@/types/admin";
import { mockFindings } from "@/data/admin";
import { AlertCircle, CheckCircle2, Play, Flame, HelpCircle, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

const statuses: FindingStatus[] = [
  "Open",
  "In Fix",
  "Ready for Retest",
  "Retest Passed",
  "Accepted Risk",
];

const severityColors: Record<FindingSeverity, string> = {
  critical: "border-l-rose-500 bg-rose-500/5",
  high: "border-l-orange-500 bg-orange-500/5",
  medium: "border-l-amber-500 bg-amber-500/5",
  low: "border-l-emerald-500 bg-emerald-500/5",
  info: "border-l-blue-500 bg-blue-500/5",
};

const severityBadgeColors: Record<FindingSeverity, string> = {
  critical: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  high: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

export function FindingBoard() {
  const [findings] = useState<Finding[]>(mockFindings);
  const [selectedSeverity, setSelectedSeverity] = useState<FindingSeverity | "all">("all");
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);

  // Filtered findings
  const filteredFindings = findings.filter(
    (f) => selectedSeverity === "all" || f.severity === selectedSeverity
  );

  // Status Column Header Icons
  const getStatusIcon = (status: FindingStatus) => {
    switch (status) {
      case "Open": return <Flame className="w-4 h-4 text-rose-400" />;
      case "In Fix": return <AlertCircle className="w-4 h-4 text-amber-400 animate-pulse" />;
      case "Ready for Retest": return <Play className="w-4 h-4 text-cyan-400" />;
      case "Retest Passed": return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case "Accepted Risk": return <HelpCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-white/5 bg-[#111118]">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Severity Filter
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedSeverity("all")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
              selectedSeverity === "all"
                ? "bg-white/10 text-white border-white/20"
                : "text-slate-400 border-transparent hover:bg-white/5 hover:text-white"
            )}
          >
            All
          </button>
          {(["critical", "high", "medium", "low", "info"] as FindingSeverity[]).map((sev) => (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold border capitalize transition-all",
                selectedSeverity === sev
                  ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                  : "text-slate-400 border-transparent hover:bg-white/5 hover:text-white"
              )}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {statuses.map((status) => {
          const statusFindings = filteredFindings.filter((f) => f.status === status);

          return (
            <div
              key={status}
              className="flex flex-col gap-3 min-w-[220px] bg-[#0a0a0f]/50 border border-white/5 rounded-xl p-3 shrink-0"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(status)}
                  <span className="text-xs font-bold text-slate-300">{status}</span>
                </div>
                <span className="text-xs text-slate-500 font-mono px-1.5 py-0.5 rounded bg-white/5">
                  {statusFindings.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="flex-1 flex flex-col gap-2.5 min-h-[300px]">
                {statusFindings.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center border border-dashed border-white/5 rounded-lg p-4 text-center">
                    <span className="text-[10px] text-slate-600">No findings</span>
                  </div>
                ) : (
                  statusFindings.map((finding) => (
                    <div
                      key={finding.id}
                      onClick={() => setSelectedFinding(finding)}
                      className={cn(
                        "p-3 rounded-lg border-l-3 border border-t-white/5 border-r-white/5 border-b-white/5 cursor-pointer transition-all hover:scale-[1.02] hover:border-white/10 active:scale-95",
                        severityColors[finding.severity]
                      )}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-[9px] font-bold text-slate-400 bg-white/5 px-1.5 py-0.5 rounded uppercase">
                          {finding.category}
                        </span>
                        <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border capitalize", severityBadgeColors[finding.severity])}>
                          {finding.severity}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white mt-2 line-clamp-2 leading-snug">
                        {finding.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-2 font-mono truncate">
                        {finding.detectedIn}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal / Panel */}
      {selectedFinding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#111118] border border-white/10 rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <span className={cn("text-xs font-bold px-2 py-0.5 rounded border capitalize", severityBadgeColors[selectedFinding.severity])}>
                  {selectedFinding.severity}
                </span>
                <span className="text-xs text-slate-400">ID: {selectedFinding.id}</span>
              </div>
              <button
                onClick={() => setSelectedFinding(null)}
                className="text-slate-400 hover:text-white text-xs font-semibold px-2.5 py-1 rounded bg-white/5 hover:bg-white/10"
              >
                Close
              </button>
            </div>

            <div>
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Title</span>
              <h3 className="text-lg font-bold text-white mt-1">{selectedFinding.title}</h3>
              <p className="text-xs font-mono text-slate-400 mt-1">Detected in: {selectedFinding.detectedIn}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <span className="text-[10px] font-bold text-indigo-400/80 uppercase tracking-wider block">Description</span>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed bg-[#0a0a0f] p-3 rounded-lg border border-white/5">
                  {selectedFinding.description}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-indigo-400/80 uppercase tracking-wider block">Impact</span>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed bg-rose-500/5 p-3 rounded-lg border border-rose-500/10">
                  {selectedFinding.impact}
                </p>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-indigo-400/80 uppercase tracking-wider block">Mitigation Guidance</span>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/10">
                {selectedFinding.mitigation}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
              <span className="text-xs text-slate-500 flex items-center gap-1.5 self-center">
                Current Status: <strong className="text-slate-300">{selectedFinding.status}</strong>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
