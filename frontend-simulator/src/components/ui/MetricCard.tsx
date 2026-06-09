"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export function MetricCard({
  label,
  value,
  change,
  icon: Icon,
  severity,
  className,
}: {
  label: string;
  value: string | number;
  change?: string;
  icon?: LucideIcon;
  severity?: "critical" | "high" | "medium" | "low" | "info";
  className?: string;
}) {
  const borderColor = severity === "critical" ? "border-l-[var(--color-accent-red)]" :
    severity === "high" ? "border-l-orange-500" :
    severity === "medium" ? "border-l-[var(--color-accent-amber)]" :
    severity === "low" ? "border-l-[var(--color-accent-green)]" :
    "border-l-[var(--color-accent-blue)]";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl p-4 border-l-4", borderColor, className)}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-[var(--color-text-muted)] tracking-wide uppercase">{label}</span>
        {Icon && <Icon className="w-4 h-4 text-[var(--color-text-muted)]" />}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-[var(--color-text-primary)] font-mono">{value}</span>
        {change && (
          <span className={cn("text-xs font-medium", change.startsWith("+") ? "text-[var(--color-accent-green)]" : change.startsWith("-") ? "text-[var(--color-accent-red)]" : "text-[var(--color-text-muted)]")}>
            {change}
          </span>
        )}
      </div>
    </motion.div>
  );
}
