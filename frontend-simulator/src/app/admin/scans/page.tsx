"use client";

import { ScanStatus } from "@/types/admin";
import { mockScans } from "@/data/admin";
import { Search, Play, CheckCircle, AlertTriangle, XCircle, Clock, ShieldAlert } from "lucide-react";
import { cn, formatDuration } from "@/lib/utils";

export default function AdminScans() {
  const getStatusIcon = (status: ScanStatus) => {
    switch (status) {
      case "Passed":
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case "Warnings":
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case "Failed":
        return <XCircle className="w-4 h-4 text-rose-400" />;
    }
  };

  const getStatusBadgeClass = (status: ScanStatus) => {
    switch (status) {
      case "Passed":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Warnings":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "Failed":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Scanner Log Executions</h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse static audit scan logs and automated test results.
          </p>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-md transition-colors">
          <Play className="w-3.5 h-3.5" />
          Trigger New Scan
        </button>
      </div>

      {/* Main Table Card */}
      <div className="overflow-hidden rounded-xl border border-white/5 bg-[#111118] shadow-sm">
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Execution Logs</h3>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase bg-white/5 px-2 py-0.5 rounded">
            {mockScans.length} Executions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-[#0a0a0f]/50 text-slate-400 font-semibold">
                <th className="px-5 py-3">Project Target</th>
                <th className="px-5 py-3">Scanner Type</th>
                <th className="px-5 py-3">Triggered Rules</th>
                <th className="px-5 py-3">Files Scanned</th>
                <th className="px-5 py-3">Duration</th>
                <th className="px-5 py-3">Findings</th>
                <th className="px-5 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {mockScans.map((scan) => (
                <tr key={scan.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4 font-bold text-white font-sans">{scan.project}</td>
                  <td className="px-5 py-4 text-slate-400 font-sans">{scan.scannerType}</td>
                  <td className="px-5 py-4 text-slate-300">{scan.rulesTriggered} rules</td>
                  <td className="px-5 py-4 text-slate-300">{scan.filesScanned} files</td>
                  <td className="px-5 py-4 text-slate-400 font-sans flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {formatDuration(scan.durationSeconds)}
                  </td>
                  <td className="px-5 py-4">
                    <span className={cn(
                      "font-sans font-bold flex items-center gap-1",
                      scan.findings > 0 ? "text-rose-400" : "text-emerald-400"
                    )}>
                      {scan.findings > 0 ? (
                        <>
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                          {scan.findings} issues
                        </>
                      ) : (
                        "Clean"
                      )}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold font-sans",
                      getStatusBadgeClass(scan.status)
                    )}>
                      {getStatusIcon(scan.status)}
                      {scan.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
