"use client";

import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

export function WarningCallout({ title, description, type = "warning", className }: { title: string; description: string; type?: "warning" | "critical" | "info"; className?: string }) {
  const colors = {
    warning: "border-[var(--color-accent-amber)] bg-[var(--color-accent-amber-bg)]",
    critical: "border-[var(--color-accent-red)] bg-[var(--color-accent-red-bg)]",
    info: "border-[var(--color-accent-blue)] bg-[var(--color-accent-blue-bg)]",
  };
  return (
    <div className={cn("flex items-start gap-3 p-4 border rounded-xl", colors[type], className)}>
      <AlertTriangle className={cn("w-5 h-5 mt-0.5 shrink-0", type === "critical" ? "text-[var(--color-accent-red)]" : type === "warning" ? "text-[var(--color-accent-amber)]" : "text-[var(--color-accent-blue)]")} />
      <div>
        <p className="text-sm font-medium text-[var(--color-text-primary)]">{title}</p>
        {description && <p className="text-xs text-[var(--color-text-secondary)] mt-1">{description}</p>}
      </div>
    </div>
  );
}
