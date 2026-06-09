"use client";

import { useState } from "react";
import { Search, Shield, FileText } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Drawer } from "@/components/ui/Drawer";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { WarningCallout } from "@/components/ui/WarningCallout";
import { SecurityNotice } from "@/components/ui/SecurityNotice";
import { scannerSummary, scannerFindings, scannerRules } from "@/data/scanner";
import type { ScannerFinding } from "@/types/scanner";

const severities = ["all", "critical", "high", "medium", "low", "info"];

type ScannerFindingRow = ScannerFinding;

const findingColumns: Column<ScannerFindingRow>[] = [
  { key: "id", label: "ID", className: "w-20" },
  { key: "title", label: "Finding", render: (f) => <span className="text-xs font-medium text-[var(--color-text-primary)]">{f.title}</span> },
  { key: "severity", label: "Severity", render: (f) => <SeverityBadge severity={f.severity} /> },
  { key: "file", label: "File", render: (f) => <span className="text-xs font-mono text-[var(--color-text-secondary)]">{f.file.split("/").pop()}</span> },
  { key: "line", label: "Line", className: "text-center" },
  { key: "status", label: "Status", render: (f) => <span className={`text-xs ${f.status === "open" ? "text-[var(--color-accent-red)]" : f.status === "fixed" ? "text-[var(--color-accent-green)]" : "text-[var(--color-accent-amber)]"}`}>{f.status.replace("_", " ")}</span> },
  { key: "confidence", label: "Confidence", render: (f) => <span className={`text-xs ${f.confidence === "high" ? "text-[var(--color-accent-green)]" : f.confidence === "medium" ? "text-[var(--color-accent-amber)]" : "text-[var(--color-text-muted)]"}`}>{f.confidence}</span> },
];

export default function ScannerPage() {
  const [sevFilter, setSevFilter] = useState("all");
  const [selectedFinding, setSelectedFinding] = useState<ScannerFindingRow | null>(null);

  const filtered: ScannerFindingRow[] = sevFilter === "all" ? scannerFindings : scannerFindings.filter(f => f.severity === sevFilter);

  return (
    <div className="space-y-6">
      <PageHeader title="Scanner Dashboard" description="Local heuristic contract scanner results" icon={Search} />

      <WarningCallout title="Important Limitation" description="This is a heuristic scanner for educational purposes. It does not replace a professional manual security review. False positives and false negatives are possible." type="info" />
      <SecurityNotice message="Local simulation only. No mainnet connection. Educational lab — not a replacement for manual security review." />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <MetricCard label="Total Findings" value={scannerSummary.totalFindings} icon={FileText} />
        <MetricCard label="Critical" value={scannerSummary.criticalCount} severity="critical" />
        <MetricCard label="High" value={scannerSummary.highCount} severity="high" />
        <MetricCard label="Rules Active" value={`${scannerSummary.rulesActive}/${scannerSummary.rulesTotal}`} icon={Shield} />
        <MetricCard label="Files Scanned" value={scannerSummary.filesScanned} />
      </div>

      <div className="flex flex-wrap gap-2">
        {severities.map(s => (
          <button key={s} onClick={() => setSevFilter(s)} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${sevFilter === s ? "bg-[var(--color-accent-blue)] text-white" : "bg-[var(--color-bg-card)] text-[var(--color-text-muted)] border border-[var(--color-border-primary)] hover:border-[var(--color-accent-blue)]/50"}`}>
            {s === "all" ? `All (${scannerSummary.totalFindings})` : s.charAt(0).toUpperCase() + s.slice(1) + ` (${scannerFindings.filter(f => f.severity === s).length})`}
          </button>
        ))}
      </div>

      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl">
        <div className="px-4 py-3 border-b border-[var(--color-border-primary)]"><h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Findings</h2></div>
        <DataTable columns={findingColumns} data={filtered} onRowClick={setSelectedFinding} />
      </div>

      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl p-4">
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">Rule Coverage</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {scannerRules.map((rule) => (
            <div key={rule.id} className={`p-2 rounded-lg border text-xs ${rule.isActive ? "bg-[var(--color-accent-green-bg)] border-[var(--color-accent-green)]/20" : "bg-[var(--color-bg-primary)] border-[var(--color-border-primary)] opacity-50"}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-[var(--color-text-primary)]">{rule.id}</span>
                {rule.isActive ? <span className="text-[var(--color-accent-green)]">Active</span> : <span className="text-[var(--color-text-muted)]">Inactive</span>}
              </div>
              <p className="text-[10px] text-[var(--color-text-muted)]">{rule.name}</p>
            </div>
          ))}
        </div>
      </div>

      <Drawer open={!!selectedFinding} onClose={() => setSelectedFinding(null)} title={selectedFinding?.id || ""}>
        {selectedFinding && (
          <div className="space-y-4">
            <div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{selectedFinding.title}</h3><SeverityBadge severity={selectedFinding.severity} /></div>
            <p className="text-xs text-[var(--color-text-secondary)]">{selectedFinding.description}</p>
            <div className="space-y-1 text-xs">
              <div><span className="text-[var(--color-text-muted)]">File: </span><span className="font-mono text-[var(--color-text-secondary)]">{selectedFinding.file}:{selectedFinding.line}</span></div>
              <div><span className="text-[var(--color-text-muted)]">Rule: </span><span className="font-mono text-[var(--color-text-secondary)]">{selectedFinding.rule}</span></div>
              <div><span className="text-[var(--color-text-muted)]">Confidence: </span><span className="font-mono">{selectedFinding.confidence}</span></div>
              <div><span className="text-[var(--color-text-muted)]">Status: </span><span className="font-mono">{selectedFinding.status}</span></div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[var(--color-text-primary)] mb-2">Code Snippet</h4>
              <CodeBlock code={selectedFinding.snippet} language="Solidity" />
            </div>
            <div className="p-3 rounded-lg bg-[var(--color-accent-green-bg)] border border-[var(--color-accent-green)]/20">
              <h4 className="text-xs font-semibold text-[var(--color-accent-green)] mb-1">Recommendation</h4>
              <p className="text-xs text-[var(--color-text-secondary)]">{selectedFinding.recommendation}</p>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
