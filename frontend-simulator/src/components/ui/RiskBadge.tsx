"use client";

import { cn } from "@/lib/utils";

export function RiskBadge({ score, className }: { score: number; className?: string }) {
  const color = score >= 80 ? "text-[var(--color-accent-red)] bg-[var(--color-accent-red-bg)]" :
    score >= 60 ? "text-[var(--color-accent-amber)] bg-[var(--color-accent-amber-bg)]" :
    score >= 40 ? "text-yellow-500 bg-yellow-500/10" :
    "text-[var(--color-accent-green)] bg-[var(--color-accent-green-bg)]";
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 text-xs font-mono font-bold rounded", color, className)}>
      {score}/100
    </span>
  );
}
