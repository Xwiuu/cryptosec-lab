"use client";

import { motion } from "framer-motion";
import { LayoutDashboard, Layers, ArrowLeftRight, Clock, Server, ShieldAlert, Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Timeline } from "@/components/ui/Timeline";
import { dashboardMetrics, systemOverviewCards, recentFindings, attackTimeline, vulnerabilityCoverage } from "@/data/dashboard";

const iconMap: Record<string, LucideIcon> = { Layers, ArrowLeftRight, Clock, Server, ShieldAlert, Search };

type FindingRow = (typeof recentFindings)[number];

const findingColumns: Column<FindingRow>[] = [
  { key: "id", label: "ID", className: "w-16" },
  { key: "title", label: "Finding", className: "min-w-[200px]" },
  { key: "severity", label: "Severity", render: (f) => <SeverityBadge severity={f.severity} /> },
  { key: "file", label: "File", className: "hidden md:table-cell" },
  { key: "status", label: "Status", render: (f) => <span className="text-xs capitalize text-[var(--color-text-muted)]">{f.status.replace("_", " ")}</span> },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="CryptoSec Lab overview" icon={LayoutDashboard} />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {systemOverviewCards.map((card, i) => (
          <MetricCard
            key={i}
            label={card.label}
            value={card.value}
            change={card.change}
            icon={iconMap[card.icon] || undefined}
            severity={card.label === "Scanner Findings" ? (dashboardMetrics.criticalFindings > 0 ? "critical" : undefined) : undefined}
          />
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl">
          <div className="px-4 py-3 border-b border-[var(--color-border-primary)]">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Latest Findings</h2>
          </div>
          <DataTable columns={findingColumns} data={recentFindings.slice(0, 6)} />
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl p-4">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">Attack Simulation Timeline</h2>
          <Timeline events={attackTimeline} />
        </motion.div>
      </div>

      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Vulnerability Coverage</h2>
          <span className="text-xs text-[var(--color-text-muted)]">{vulnerabilityCoverage.covered}/{vulnerabilityCoverage.total} covered</span>
        </div>
        <div className="space-y-3">
          {vulnerabilityCoverage.categories.map((cat) => (
            <div key={cat.name}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[var(--color-text-secondary)]">{cat.name}</span>
                <span className="text-xs text-[var(--color-text-muted)]">{cat.covered}/{cat.total}</span>
              </div>
              <div className="h-1.5 bg-[var(--color-bg-primary)] rounded-full overflow-hidden">
                <div className="h-full bg-[var(--color-accent-blue)] rounded-full transition-all" style={{ width: `${(cat.covered / cat.total) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
