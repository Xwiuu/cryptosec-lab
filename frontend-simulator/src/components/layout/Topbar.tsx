"use client";

import { cn } from "@/lib/utils";
import { Menu, Wifi, Blocks, Clock, Activity } from "lucide-react";
import { dashboardMetrics } from "@/data/dashboard";
import { mempoolSummary } from "@/data/mempool";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="sticky top-0 z-20 h-14 border-b border-[var(--color-border-primary)] bg-[var(--color-topbar-bg)] backdrop-blur-xl">
      <div className="flex items-center h-full px-4 gap-4">
        <button
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-[var(--color-bg-card-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-blue)]"
        >
          <Menu className="w-4 h-4 text-[var(--color-text-secondary)]" />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-accent-cyan-bg)] border border-[var(--color-accent-cyan)]/20">
            <Wifi className="w-3.5 h-3.5 text-[var(--color-accent-cyan)]" />
            <span className="text-xs font-medium text-[var(--color-accent-cyan)] whitespace-nowrap">
              CryptoSec Localnet
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-accent-blue-bg)] border border-[var(--color-accent-blue)]/20">
            <span className="text-[10px] font-medium text-[var(--color-accent-blue)]">Local Simulation</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3 ml-auto">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border-primary)]">
            <Blocks className="w-3 h-3 text-[var(--color-text-muted)]" />
            <span className="text-xs font-mono text-[var(--color-text-secondary)]">
              {dashboardMetrics.totalBlocks.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border-primary)]">
            <Clock className="w-3 h-3 text-[var(--color-text-muted)]" />
            <span className="text-xs font-mono text-[var(--color-text-secondary)]">
              {mempoolSummary.totalPending} pending
            </span>
          </div>
          <div
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border",
              dashboardMetrics.criticalFindings > 0
                ? "bg-[var(--color-accent-red-bg)] border-[var(--color-accent-red)]/20"
                : "bg-[var(--color-accent-green-bg)] border-[var(--color-accent-green)]/20"
            )}
          >
            <Activity
              className={cn(
                "w-3 h-3",
                dashboardMetrics.criticalFindings > 0
                  ? "text-[var(--color-accent-red)]"
                  : "text-[var(--color-accent-green)]"
              )}
            />
            <span
              className={cn(
                "text-xs font-mono",
                dashboardMetrics.criticalFindings > 0
                  ? "text-[var(--color-accent-red)]"
                  : "text-[var(--color-accent-green)]"
              )}
            >
              Risk: {dashboardMetrics.criticalFindings > 0 ? "High" : "Low"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--color-border-primary)]">
            <div className="w-2 h-2 rounded-full bg-[var(--color-accent-green)] animate-pulse" />
            <span className="text-xs text-[var(--color-text-muted)]">Scanner OK</span>
          </div>
        </div>
      </div>
    </header>
  );
}
