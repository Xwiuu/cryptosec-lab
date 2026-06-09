"use client";

import { useState, useMemo } from "react";
import { findings } from "@/data/findings";
import { SeverityCard } from "@/components/SeverityCard";
import { FindingTable } from "@/components/FindingTable";
import { Severity, Finding } from "@/data/types";

export default function Home() {
  const [severityFilter, setSeverityFilter] = useState<Severity | "All">("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  const categories = useMemo(() => {
    const cats = new Set(findings.map((f) => f.category));
    return ["All", ...Array.from(cats).sort()];
  }, []);

  const filtered = useMemo(() => {
    return findings.filter((f) => {
      if (severityFilter !== "All" && f.severity !== severityFilter) return false;
      if (categoryFilter !== "All" && f.category !== categoryFilter) return false;
      return true;
    });
  }, [severityFilter, categoryFilter]);

  const counts = useMemo(() => {
    const c = { Critical: 0, High: 0, Medium: 0, Low: 0, Informational: 0 };
    for (const f of findings) {
      if (c[f.severity] !== undefined) c[f.severity]++;
    }
    return c;
  }, []);

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">CryptoSec Lab</h1>
        <p className="text-gray-400 mt-1">Security Audit Findings Dashboard</p>
      </header>

      <div className="grid grid-cols-5 gap-4 mb-8">
        <SeverityCard label="Critical" count={counts.Critical} color="critical" />
        <SeverityCard label="High" count={counts.High} color="high" />
        <SeverityCard label="Medium" count={counts.Medium} color="medium" />
        <SeverityCard label="Low" count={counts.Low} color="low" />
        <SeverityCard label="Info" count={counts.Informational} color="info" />
      </div>

      <div className="flex gap-4 mb-6">
        <select
          className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value as Severity | "All")}
        >
          <option value="All">All Severities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
          <option value="Informational">Informational</option>
        </select>

        <select
          className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <span className="text-sm text-gray-400 self-center ml-auto">
          {filtered.length} of {findings.length} findings
        </span>
      </div>

      <FindingTable findings={filtered} />

      <footer className="mt-12 pt-6 border-t border-gray-800 text-center text-gray-500 text-sm">
        CryptoSec Lab — Educational Security Dashboard &middot; Not for production use
      </footer>
    </main>
  );
}
