"use client";

import { FolderGit2, ShieldAlert, Search, FileText, Activity } from "lucide-react";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { ClientRiskSummary } from "@/components/admin/ClientRiskSummary";
import { LabRunTimeline } from "@/components/admin/LabRunTimeline";
import { mockProjects, mockFindings, mockScans, mockReports } from "@/data/admin";

export default function AdminOverview() {
  const totalProjects = mockProjects.length;
  const activeReviews = mockProjects.filter((p) => p.status !== "Completed").length;
  const criticalFindings = mockFindings.filter((f) => f.severity === "critical").length;
  const totalScans = mockScans.length;
  const reportsCount = mockReports.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Consulting Overview</h1>
        <p className="text-xs text-slate-400 mt-1">
          Monitor your ongoing security engagements, client risk assessments, and vulnerability metrics.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <AdminMetricCard
          title="Total Projects"
          value={totalProjects}
          icon={FolderGit2}
          description="Engagements active & past"
        />
        <AdminMetricCard
          title="Active Reviews"
          value={activeReviews}
          icon={Activity}
          iconColor="text-blue-400 bg-blue-500/10 border-blue-500/20"
          description="Currently in audit phase"
        />
        <AdminMetricCard
          title="Critical Findings"
          value={criticalFindings}
          icon={ShieldAlert}
          iconColor="text-rose-400 bg-rose-500/10 border-rose-500/20"
          change="Urgent"
          isPositive={false}
          description="Unmitigated exploits"
        />
        <AdminMetricCard
          title="Scanner Runs"
          value={totalScans}
          icon={Search}
          iconColor="text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
          description="Cargo & Foundry static rules"
        />
        <AdminMetricCard
          title="Reports Generated"
          value={reportsCount}
          icon={FileText}
          iconColor="text-purple-400 bg-purple-500/10 border-purple-500/20"
          description="Deliverables created"
        />
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3 width on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          <ClientRiskSummary />
        </div>

        {/* Right Column (1/3 width on large screens) */}
        <div className="space-y-6 bg-[#111118] border border-white/5 p-5 rounded-xl">
          <LabRunTimeline />
        </div>
      </div>
    </div>
  );
}
