"use client";

import { cn } from "@/lib/utils";

const severityConfig = {
  critical: { label: "Critical", className: "bg-[var(--color-accent-red-bg)] text-[var(--color-accent-red)] border border-[var(--color-accent-red)]/30" },
  high: { label: "High", className: "bg-orange-500/10 text-orange-500 border border-orange-500/30" },
  medium: { label: "Medium", className: "bg-[var(--color-accent-amber-bg)] text-[var(--color-accent-amber)] border border-[var(--color-accent-amber)]/30" },
  low: { label: "Low", className: "bg-[var(--color-accent-green-bg)] text-[var(--color-accent-green)] border border-[var(--color-accent-green)]/30" },
  info: { label: "Info", className: "bg-[var(--color-accent-blue-bg)] text-[var(--color-accent-blue)] border border-[var(--color-accent-blue)]/30" },
} as const;

export function SeverityBadge({ severity, className }: { severity: string; className?: string }) {
  const config = severityConfig[severity as keyof typeof severityConfig] || severityConfig.info;
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full", config.className, className)}>
      {config.label}
    </span>
  );
}
