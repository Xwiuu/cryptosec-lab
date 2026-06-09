"use client";

import { cn } from "@/lib/utils";
import { LucideIcon, Inbox } from "lucide-react";

export function EmptyState({ icon: Icon = Inbox, title, description, className }: { icon?: LucideIcon; title: string; description?: string; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
      <Icon className="w-12 h-12 text-[var(--color-text-muted)] mb-4" />
      <h3 className="text-sm font-medium text-[var(--color-text-primary)] mb-1">{title}</h3>
      {description && <p className="text-xs text-[var(--color-text-muted)] max-w-sm">{description}</p>}
    </div>
  );
}
