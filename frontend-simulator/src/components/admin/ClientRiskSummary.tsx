"use client";

import { mockClients } from "@/data/admin";
import { UserCheck, Award } from "lucide-react";
import { cn } from "@/lib/utils";

export function ClientRiskSummary() {
  const getRiskLabel = (score: number) => {
    if (score >= 80) return "High Risk";
    if (score >= 40) return "Medium Risk";
    return "Low Risk";
  };

  const getRiskColorClass = (score: number) => {
    if (score >= 80) return "text-rose-400 bg-rose-500/10 border-rose-500/20";
    if (score >= 40) return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
  };

  const getRiskBgClass = (score: number) => {
    if (score >= 80) return "bg-rose-500";
    if (score >= 40) return "bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <div className="overflow-hidden rounded-xl border border-white/5 bg-[#111118] shadow-sm">
      <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white">Client Portfolio & Risk Indices</h3>
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase bg-white/5 px-2 py-0.5 rounded">
          {mockClients.length} Total
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-[#0a0a0f]/50 text-slate-400 font-semibold">
              <th className="px-5 py-3">Client Name</th>
              <th className="px-5 py-3">Industry</th>
              <th className="px-5 py-3">Risk Assessment</th>
              <th className="px-5 py-3">Audits Completed</th>
              <th className="px-5 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {mockClients.map((client) => (
              <tr key={client.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-4 font-bold text-white">{client.name}</td>
                <td className="px-5 py-4 text-slate-400">{client.industry}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className={cn("px-2 py-0.5 rounded border text-[10px] font-bold", getRiskColorClass(client.riskScore))}>
                      {getRiskLabel(client.riskScore)}
                    </span>
                    <div className="flex items-center gap-1.5 min-w-[70px]">
                      <span className="text-slate-300 font-mono font-semibold">{client.riskScore}%</span>
                      <div className="h-1.5 flex-1 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className={cn("h-full rounded-full", getRiskBgClass(client.riskScore))}
                          style={{ width: `${client.riskScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-slate-300 font-bold">{client.auditsCompleted} reports</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-right">
                  <span className={cn(
                    "inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border",
                    client.status === "Active"
                      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                      : "text-slate-400 bg-slate-500/10 border-slate-500/20"
                  )}>
                    <span className={cn("w-1 h-1 rounded-full", client.status === "Active" ? "bg-emerald-400 animate-pulse" : "bg-slate-400")} />
                    {client.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
