"use client";

import { useState } from "react";
import { Project } from "@/types/admin";
import { Folder, GitFork, Calendar, ShieldAlert, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [expanded, setExpanded] = useState(false);

  // Status styling map
  const statusStyles: Record<string, string> = {
    Discovery: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    "In Review": "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    "Findings Ready": "bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse",
    Fixing: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    Retest: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    Completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };

  // Get color for risk score
  const getRiskColor = (score: number) => {
    if (score >= 80) return "text-rose-500";
    if (score >= 50) return "text-amber-500";
    return "text-emerald-500";
  };

  const getRiskBg = (score: number) => {
    if (score >= 80) return "bg-rose-500";
    if (score >= 50) return "bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <div className="rounded-xl border border-white/5 bg-[#111118] overflow-hidden transition-all hover:border-white/10 shadow-sm">
      <div
        className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center border border-white/5 shrink-0">
            <Folder className="w-5 h-5 text-slate-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-white">{project.name}</h3>
              <span className={cn("text-xs font-semibold px-2 py-0.5 rounded border", statusStyles[project.status])}>
                {project.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Client: <strong className="text-slate-300">{project.client}</strong></p>
          </div>
        </div>

        <div className="flex items-center gap-6 self-end md:self-auto">
          {/* Findings Count Breakdown */}
          <div className="hidden sm:flex items-center gap-2">
            {project.findingsCount.critical > 0 && (
              <span className="flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-1 rounded-md border border-rose-500/20">
                <ShieldAlert className="w-3.5 h-3.5" />
                {project.findingsCount.critical} Crit
              </span>
            )}
            {project.findingsCount.high > 0 && (
              <span className="flex items-center gap-1 text-xs font-bold text-orange-400 bg-orange-500/10 px-2 py-1 rounded-md border border-orange-500/20">
                <AlertTriangle className="w-3.5 h-3.5" />
                {project.findingsCount.high} High
              </span>
            )}
            <span className="text-xs text-slate-500">
              {project.findingsCount.medium + project.findingsCount.low + project.findingsCount.info} others
            </span>
          </div>

          {/* Risk Score */}
          <div className="text-right">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Risk Score</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={cn("text-lg font-bold", getRiskColor(project.riskScore))}>
                {project.riskScore}%
              </span>
              <div className="w-12 h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className={cn("h-full rounded-full", getRiskBg(project.riskScore))}
                  style={{ width: `${project.riskScore}%` }}
                />
              </div>
            </div>
          </div>

          <button className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/5">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 pt-1 border-t border-white/5 bg-[#111118]/60 space-y-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Description</h4>
            <p className="text-sm text-slate-300 mt-1 leading-relaxed">{project.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <GitFork className="w-4 h-4 text-slate-500" />
              <span>Repository: </span>
              <a href={`https://${project.repoUrl}`} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">
                {project.repoUrl}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>Timeline: {project.startDate} to {project.endDate || "Ongoing"}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#0a0a0f] border border-white/5 space-y-2">
            <h4 className="text-xs font-bold text-slate-300">Audited Security Metrics Breakdown</h4>
            <div className="grid grid-cols-5 gap-2 text-center text-xs">
              <div className="p-2 rounded bg-rose-500/5 border border-rose-500/10">
                <span className="block font-bold text-rose-400">{project.findingsCount.critical}</span>
                <span className="text-[10px] text-slate-500">Critical</span>
              </div>
              <div className="p-2 rounded bg-orange-500/5 border border-orange-500/10">
                <span className="block font-bold text-orange-400">{project.findingsCount.high}</span>
                <span className="text-[10px] text-slate-500">High</span>
              </div>
              <div className="p-2 rounded bg-amber-500/5 border border-amber-500/10">
                <span className="block font-bold text-amber-400">{project.findingsCount.medium}</span>
                <span className="text-[10px] text-slate-500">Medium</span>
              </div>
              <div className="p-2 rounded bg-emerald-500/5 border border-emerald-500/10">
                <span className="block font-bold text-emerald-400">{project.findingsCount.low}</span>
                <span className="text-[10px] text-slate-500">Low</span>
              </div>
              <div className="p-2 rounded bg-blue-500/5 border border-blue-500/10">
                <span className="block font-bold text-blue-400">{project.findingsCount.info}</span>
                <span className="text-[10px] text-slate-500">Info</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
