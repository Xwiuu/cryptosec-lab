"use client";

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export function PageHeader({
  title,
  description,
  icon: Icon,
  actions,
  className,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-6", className)}>
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="p-2 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-primary)]">
            <Icon className="w-5 h-5 text-[var(--color-accent-blue)]" />
          </div>
        )}
        <div>
          <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">{title}</h1>
          {description && (
            <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
