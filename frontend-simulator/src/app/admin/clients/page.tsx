"use client";

import { ClientRiskSummary } from "@/components/admin/ClientRiskSummary";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { Users, ShieldAlert, Award } from "lucide-react";
import { mockClients } from "@/data/admin";

export default function AdminClients() {
  const totalClients = mockClients.length;
  const avgRisk = Math.round(
    mockClients.reduce((acc, c) => acc + c.riskScore, 0) / totalClients
  );
  const totalAudits = mockClients.reduce((acc, c) => acc + c.auditsCompleted, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Client Portfolio</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage client profiles, risk ratings, and history of active audit retainers.
          </p>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-md transition-colors">
          <Users className="w-3.5 h-3.5" />
          Add Client
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AdminMetricCard
          title="Active Clients"
          value={totalClients}
          icon={Users}
          description="Retained client protocols"
        />
        <AdminMetricCard
          title="Average Portfolio Risk"
          value={`${avgRisk}%`}
          icon={ShieldAlert}
          iconColor="text-rose-400 bg-rose-500/10 border-rose-500/20"
          description="Average client danger score"
        />
        <AdminMetricCard
          title="Completed Audits"
          value={totalAudits}
          icon={Award}
          iconColor="text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
          description="Total delivered deliverables"
        />
      </div>

      {/* Client List */}
      <ClientRiskSummary />
    </div>
  );
}
