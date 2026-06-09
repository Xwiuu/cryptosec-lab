"use client";

import { cn } from "@/lib/utils";
import { ShieldAlert, Info } from "lucide-react";

export function StatusBar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-30 h-7 border-t border-[var(--color-border-primary)] bg-[var(--color-bg-primary)]/90 backdrop-blur-md flex items-center px-4 gap-3 overflow-x-auto",
        className
      )}
    >
      <div className="flex items-center gap-1.5">
        <ShieldAlert className="w-3 h-3 text-[var(--color-accent-amber)]" />
        <span className="text-[10px] font-medium text-[var(--color-accent-amber)]">Local Simulation</span>
      </div>
      <div className="h-3 w-px shrink-0 bg-[var(--color-border-primary)]" />
      <span className="text-[10px] text-[var(--color-text-muted)]">No mainnet connection</span>
      <div className="hidden h-3 w-px shrink-0 bg-[var(--color-border-primary)] sm:block" />
      <span className="hidden text-[10px] text-[var(--color-text-muted)] sm:inline">Educational only</span>
      <div className="h-3 w-px shrink-0 bg-[var(--color-border-primary)]" />
      <span className="text-[10px] text-[var(--color-text-muted)]">No real funds or keys</span>
      <div className="ml-auto hidden items-center gap-1.5 sm:flex">
        <Info className="w-3 h-3 text-[var(--color-text-muted)]" />
        <span className="text-[10px] text-[var(--color-text-muted)]">v1.0.0 • CryptoSec Lab</span>
      </div>
    </div>
  );
}
