"use client";

import { ReportStatus } from "@/types/admin";
import { mockReports } from "@/data/admin";
import { FileText, Eye, CheckCircle2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const pipelineStages: ReportStatus[] = [
  "Draft",
  "Internal Review",
  "Sent to Client",
  "Retest Updated",
  "Final",
];

const statusBgMap: Record<ReportStatus, string> = {
  Draft: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Internal Review": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "Sent to Client": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "Retest Updated": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  Final: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

export function ReportPipeline() {
  return (
    <div className="space-y-6">
      {/* Horizontal Pipeline Steps Overview */}
      <div className="hidden lg:grid grid-cols-5 gap-3 p-4 rounded-xl border border-white/5 bg-[#111118]">
        {pipelineStages.map((stage, i) => (
          <div key={stage} className="flex items-center gap-2 relative">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-slate-300">
              {i + 1}
            </div>
            <div>
              <span className="text-xs font-bold text-slate-200 block">{stage}</span>
              <span className="text-[10px] text-slate-500">Pipeline Stage</span>
            </div>
            {i < pipelineStages.length - 1 && (
              <ChevronRight className="w-4 h-4 text-slate-700 absolute -right-2 top-1/2 -translate-y-1/2" />
            )}
          </div>
        ))}
      </div>

      {/* Reports List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockReports.map((report) => {
          const currentStageIndex = pipelineStages.indexOf(report.status);

          return (
            <div
              key={report.id}
              className="p-5 rounded-xl border border-white/5 bg-[#111118] space-y-4 hover:border-white/10 transition-colors shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-500/5 border border-indigo-500/15 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{report.projectName}</h3>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">Version: {report.version}</p>
                  </div>
                </div>
                <span className={cn("text-xs font-semibold px-2 py-0.5 rounded border capitalize", statusBgMap[report.status])}>
                  {report.status}
                </span>
              </div>

              {/* Pipeline Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                  <span>Progress</span>
                  <span>{Math.round(((currentStageIndex + 1) / pipelineStages.length) * 100)}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden flex gap-0.5">
                  {pipelineStages.map((_, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "h-full flex-1 first:rounded-l-full last:rounded-r-full transition-all duration-300",
                        idx <= currentStageIndex
                          ? "bg-gradient-to-r from-indigo-500 to-indigo-600"
                          : "bg-white/5"
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Report Details & Action Buttons */}
              <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
                <span className="text-slate-500">
                  Last updated: <strong className="text-slate-400 font-mono">{report.lastUpdated}</strong>
                </span>

                <div className="flex gap-2">
                  <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors">
                    <Eye className="w-3.5 h-3.5" />
                    Preview
                  </button>
                  {report.status === "Final" && (
                    <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 border border-emerald-500/20 transition-colors">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Download Final
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
