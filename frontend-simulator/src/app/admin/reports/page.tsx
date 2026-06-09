"use client";

import { ReportPipeline } from "@/components/admin/ReportPipeline";
import { FilePlus } from "lucide-react";

export default function AdminReports() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Report Pipeline</h1>
          <p className="text-xs text-slate-400 mt-1">
            Track and build security audit reports through delivery pipeline stages.
          </p>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-md transition-colors">
          <FilePlus className="w-3.5 h-3.5" />
          Create Report
        </button>
      </div>

      {/* Report Pipeline */}
      <ReportPipeline />
    </div>
  );
}
