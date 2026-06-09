"use client";

import { FindingBoard } from "@/components/admin/FindingBoard";

export default function AdminFindings() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Vulnerabilities Board</h1>
        <p className="text-xs text-slate-400 mt-1">
          Track and resolve auditing issues found during manual and automated code reviews.
        </p>
      </div>

      {/* Finding Board */}
      <FindingBoard />
    </div>
  );
}
