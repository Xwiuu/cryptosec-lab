"use client";

import { useState } from "react";
import { ProjectStatus } from "@/types/admin";
import { mockProjects } from "@/data/admin";
import { ProjectCard } from "@/components/admin/ProjectCard";
import { FolderPlus, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

const statuses: (ProjectStatus | "All")[] = [
  "All",
  "Discovery",
  "In Review",
  "Findings Ready",
  "Fixing",
  "Retest",
  "Completed",
];

export default function AdminProjects() {
  const [filter, setFilter] = useState<ProjectStatus | "All">("All");

  const filteredProjects = mockProjects.filter(
    (p) => filter === "All" || p.status === filter
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Security Engagements</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your smart contract audits and protocol reviews.
          </p>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-md transition-colors">
          <FolderPlus className="w-3.5 h-3.5" />
          New Engagement
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 p-4 rounded-xl border border-white/5 bg-[#111118] overflow-x-auto">
        <Filter className="w-4 h-4 text-slate-500 shrink-0" />
        <div className="flex gap-2">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap",
                filter === status
                  ? "bg-white/10 text-white border-white/20"
                  : "text-slate-400 border-transparent hover:bg-white/5 hover:text-white"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Projects list */}
      <div className="space-y-4">
        {filteredProjects.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-white/5 rounded-xl">
            <p className="text-sm text-slate-500">No active engagements found matching this status.</p>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))
        )}
      </div>
    </div>
  );
}
