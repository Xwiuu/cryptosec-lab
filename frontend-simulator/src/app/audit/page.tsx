"use client";

import { useState } from "react";
import { FileText, CheckCircle, Download, Eye } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { SecurityNotice } from "@/components/ui/SecurityNotice";
import { WarningCallout } from "@/components/ui/WarningCallout";

const scopeItems = [
  "VulnerableBank.sol", "SecureBank.sol", "VulnerableToken.sol", "SecureToken.sol",
  "VulnerableAMM.sol", "VulnerableOracle.sol", "VulnerableLending.sol", "VulnerableBridge.sol",
];

const initialFindings = [
  { id: "F-001", title: "Reentrancy in withdraw()", severity: "critical", status: "Open", file: "VulnerableBank.sol", line: 42 },
  { id: "F-002", title: "Unprotected mint function", severity: "critical", status: "Open", file: "VulnerableToken.sol", line: 23 },
  { id: "F-003", title: "Bad randomness in lottery", severity: "high", status: "Open", file: "VulnerableRandomness.sol", line: 8 },
  { id: "F-004", title: "Slippage protection missing", severity: "high", status: "Open", file: "VulnerableAMM.sol", line: 87 },
  { id: "F-005", title: "Difficulty bypass", severity: "critical", status: "Fixed", file: "difficulty_bypass.rs", line: 10 },
  { id: "F-006", title: "Timestamp manipulation", severity: "medium", status: "Accepted Risk", file: "VulnerableRandomness.sol", line: 5 },
  { id: "F-007", title: "Upgradeability risk", severity: "critical", status: "Open", file: "VulnerableUpgradeable.sol", line: 3 },
  { id: "F-008", title: "Bridge message replay", severity: "critical", status: "Open", file: "VulnerableBridge.sol", line: 34 },
];

const statusOptions = ["Open", "Fixed", "Accepted Risk", "Retest Passed"] as const;
type AuditFindingItem = (typeof initialFindings)[number];

export default function AuditPage() {
  const [findings, setFindings] = useState<AuditFindingItem[]>(initialFindings);
  const [selectedFindingIds, setSelectedFindingIds] = useState<string[]>(initialFindings.map((finding) => finding.id));
  const [executiveSummary, setExecutiveSummary] = useState(
    "The CryptoSec Lab security audit identified multiple vulnerabilities across the smart contract and protocol layers. " +
    "Critical findings include reentrancy, unprotected mint functions, upgradeability risks, and bridge message replay vulnerabilities. " +
    "High-severity findings include bad randomness and missing slippage protection. " +
    "The difficulty bypass finding has been fixed in the latest version. All other findings require remediation before deployment."
  );
  const [exported, setExported] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const changeStatus = (id: string, newStatus: AuditFindingItem["status"]) => {
    setFindings(fs => fs.map(f => f.id === id ? { ...f, status: newStatus } : f));
  };

  const toggleFinding = (id: string) => {
    setSelectedFindingIds((ids) => ids.includes(id) ? ids.filter((selectedId) => selectedId !== id) : [...ids, id]);
  };

  const criticalCount = findings.filter(f => f.severity === "critical" && f.status !== "Fixed").length;
  const highCount = findings.filter(f => f.severity === "high" && f.status !== "Fixed").length;
  const previewFindings = findings.filter((finding) => selectedFindingIds.includes(finding.id));

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Report Builder" description="Build simulated security audit reports" icon={FileText} />
      <SecurityNotice message="Local simulation only. Educational lab — not a replacement for manual security review. This report is simulated and is not an official certification." />
      <WarningCallout title="Audit Scope Limitation" description="Use this builder for education and portfolio material only. It does not attest that any real protocol is secure." type="info" />

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl p-4">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">Audit Scope</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {scopeItems.map((item) => (
                <div key={item} className="flex items-center gap-2 p-2 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)]">
                  <CheckCircle className="w-3.5 h-3.5 text-[var(--color-accent-blue)] shrink-0" />
                  <span className="text-xs font-mono text-[var(--color-text-secondary)]">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl">
            <div className="px-4 py-3 border-b border-[var(--color-border-primary)] flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Findings</h2>
              <div className="flex gap-2 text-xs">
                <span className="text-[var(--color-accent-red)]">{criticalCount} critical</span>
                <span className="text-[var(--color-text-muted)]">•</span>
                <span className="text-orange-500">{highCount} high</span>
              </div>
            </div>
            <div className="divide-y divide-[var(--color-border-primary)]">
              {findings.map((f) => (
                <div key={f.id} className="flex flex-col gap-3 p-3 hover:bg-[var(--color-bg-card-hover)] transition-colors sm:flex-row sm:items-center">
                  <input
                    id={`include-${f.id}`}
                    type="checkbox"
                    checked={selectedFindingIds.includes(f.id)}
                    onChange={() => toggleFinding(f.id)}
                    className="h-4 w-4 rounded border-[var(--color-border-primary)] bg-[var(--color-bg-primary)] accent-[var(--color-accent-blue)]"
                  />
                  <SeverityBadge severity={f.severity} />
                  <div className="flex-1 min-w-0">
                    <label htmlFor={`include-${f.id}`} className="text-xs font-medium text-[var(--color-text-primary)]">{f.title}</label>
                    <span className="text-[10px] text-[var(--color-text-muted)] ml-2">{f.file}:{f.line}</span>
                  </div>
                  <select
                    aria-label={`Status for ${f.id}`}
                    value={f.status}
                    onChange={(e) => changeStatus(f.id, e.target.value as AuditFindingItem["status"])}
                    className={`w-full text-xs px-2 py-1 rounded border bg-[var(--color-bg-primary)] sm:w-auto ${f.status === "Open" ? "text-[var(--color-accent-red)] border-[var(--color-accent-red)]/30" : f.status === "Fixed" ? "text-[var(--color-accent-green)] border-[var(--color-accent-green)]/30" : f.status === "Accepted Risk" ? "text-[var(--color-accent-amber)] border-[var(--color-accent-amber)]/30" : "text-[var(--color-accent-blue)] border-[var(--color-accent-blue)]/30"}`}
                  >
                    {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl p-4">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">Report Summary</h2>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Total Findings</span><span className="font-mono">{findings.length}</span></div>
              <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Critical</span><span className="font-mono text-[var(--color-accent-red)]">{findings.filter(f => f.severity === "critical").length}</span></div>
              <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">High</span><span className="font-mono text-orange-500">{findings.filter(f => f.severity === "high").length}</span></div>
              <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Open</span><span className="font-mono text-[var(--color-accent-red)]">{findings.filter(f => f.status === "Open").length}</span></div>
              <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Fixed</span><span className="font-mono text-[var(--color-accent-green)]">{findings.filter(f => f.status === "Fixed").length}</span></div>
              <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Scope Items</span><span className="font-mono">{scopeItems.length}</span></div>
              <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Included</span><span className="font-mono">{previewFindings.length}</span></div>
            </div>
          </div>

          <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl p-4">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">Actions</h2>
            <div className="space-y-2">
              <button onClick={() => setShowPreview(!showPreview)} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium rounded-lg bg-[var(--color-accent-blue)] text-white hover:bg-blue-600 transition-colors">
                <Eye className="w-3.5 h-3.5" /> {showPreview ? "Hide" : "Preview"} Report
              </button>
              <button onClick={() => { setExported(true); setTimeout(() => setExported(false), 3000); }} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium rounded-lg bg-[var(--color-accent-green)] text-white hover:bg-green-600 transition-colors">
                <Download className="w-3.5 h-3.5" /> Export Report
              </button>
              {exported && <p className="text-xs text-[var(--color-accent-green)] text-center">Report exported (simulated)</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl p-4 space-y-3">
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Executive Summary</h2>
        <label htmlFor="executive-summary" className="sr-only">Executive Summary</label>
        <textarea
          id="executive-summary"
          value={executiveSummary}
          onChange={(e) => setExecutiveSummary(e.target.value)}
          className="w-full h-24 px-3 py-2 text-xs bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)] rounded-lg text-[var(--color-text-secondary)] resize-none focus:outline-none focus:border-[var(--color-accent-blue)]"
        />
      </div>

      {showPreview && (
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Report Preview</h2>
          <div className="prose prose-invert prose-xs max-w-none text-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Executive Summary</h3>
              <p className="text-[var(--color-text-secondary)] mt-1">{executiveSummary}</p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Scope</h3>
              <ul className="list-disc list-inside text-[var(--color-text-muted)]">{scopeItems.map(s => <li key={s} className="font-mono">{s}</li>)}</ul>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Findings Summary</h3>
              <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-xs border-collapse">
                <thead><tr className="border-b border-[var(--color-border-primary)]"><th className="text-left py-1 text-[var(--color-text-muted)]">ID</th><th className="text-left py-1 text-[var(--color-text-muted)]">Title</th><th className="text-left py-1 text-[var(--color-text-muted)]">Severity</th><th className="text-left py-1 text-[var(--color-text-muted)]">Status</th></tr></thead>
                <tbody>{previewFindings.map(f => <tr key={f.id} className="border-b border-[var(--color-border-primary)]"><td className="py-1 font-mono">{f.id}</td><td className="py-1">{f.title}</td><td className="py-1">{f.severity}</td><td className="py-1">{f.status}</td></tr>)}</tbody>
              </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
