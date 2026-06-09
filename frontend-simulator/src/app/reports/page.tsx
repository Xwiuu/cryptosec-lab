"use client";

import { useState } from "react";
import { BookOpen, FileText, Calendar, User, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/layout/PageHeader";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { SecurityNotice } from "@/components/ui/SecurityNotice";
import { sampleReports } from "@/data/reports";

export default function ReportsPage() {
  const [expandedReport, setExpandedReport] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader title="Sample Reports" description="Example audit reports for reference and education" icon={BookOpen} />
      <SecurityNotice message="Local simulation only. Educational lab — not a replacement for manual security review. Sample reports are not official certifications." />

      <div className="space-y-4">
        {sampleReports.map((report) => {
          const isExpanded = expandedReport === report.id;
          return (
            <motion.div key={report.id} layout className="bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedReport(isExpanded ? null : report.id)}
                aria-expanded={isExpanded}
                className="w-full p-4 flex items-center justify-between hover:bg-[var(--color-bg-card-hover)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-blue)] focus-visible:ring-inset"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-[var(--color-text-muted)]" />
                  <div className="text-left">
                    <span className="text-sm font-medium text-[var(--color-text-primary)]">{report.title}</span>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-[var(--color-text-muted)]">{report.date}</span>
                      <SeverityBadge severity={report.severity} />
                      <span className="text-xs text-[var(--color-text-muted)] capitalize">{report.type.replace("_", " ")}</span>
                      <span className={`text-xs ${report.status === "final" ? "text-[var(--color-accent-green)]" : "text-[var(--color-accent-amber)]"}`}>{report.status}</span>
                    </div>
                  </div>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-[var(--color-text-muted)]" /> : <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)]" />}
              </button>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                    <div className="border-t border-[var(--color-border-primary)] p-4 space-y-4">
                      <div className="flex items-center gap-4 text-xs">
                        <span><Calendar className="w-3 h-3 inline mr-1 text-[var(--color-text-muted)]" />{report.date}</span>
                        <span><User className="w-3 h-3 inline mr-1 text-[var(--color-text-muted)]" />{report.client}</span>
                        <span><FileText className="w-3 h-3 inline mr-1 text-[var(--color-text-muted)]" />{report.scope.length} files</span>
                      </div>
                      <div className="p-3 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)]">
                        <h4 className="text-xs font-semibold text-[var(--color-text-primary)] mb-1">Executive Summary</h4>
                        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{report.executiveSummary}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-[var(--color-text-primary)] mb-2">Scope</h4>
                        <div className="flex flex-wrap gap-2">
                          {report.scope.map((item) => (
                            <span key={item} className="px-2 py-1 text-[10px] font-mono rounded bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)] text-[var(--color-text-secondary)]">{item}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-[var(--color-text-primary)] mb-2">Findings</h4>
                        <div className="space-y-2">
                          {report.findings.map((finding) => (
                            <div key={finding.id} className="flex items-start gap-3 p-3 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)]">
                              <SeverityBadge severity={finding.severity} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-[var(--color-text-primary)]">{finding.title}</span>
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${finding.status === "open" ? "bg-[var(--color-accent-red-bg)] text-[var(--color-accent-red)]" : finding.status === "fixed" ? "bg-[var(--color-accent-green-bg)] text-[var(--color-accent-green)]" : "bg-[var(--color-accent-amber-bg)] text-[var(--color-accent-amber)]"}`}>{finding.status}</span>
                                </div>
                                <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{finding.file}:{finding.line}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
