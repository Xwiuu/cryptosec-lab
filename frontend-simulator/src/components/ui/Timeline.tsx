"use client";

import { cn } from "@/lib/utils";
import { SeverityBadge } from "./SeverityBadge";

export interface TimelineEvent {
  id: string;
  name: string;
  target: string;
  severity: string;
  timestamp: string;
  status: string;
  block?: number;
}

export function Timeline({ events, className }: { events: TimelineEvent[]; className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <div className="absolute left-4 top-0 bottom-0 w-px bg-[var(--color-border-primary)]" />
      <div className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className="relative pl-10">
            <div className={cn(
              "absolute left-2.5 w-3 h-3 rounded-full border-2 bg-[var(--color-bg-primary)] mt-1.5",
              event.severity === "critical" ? "border-[var(--color-accent-red)]" :
              event.severity === "high" ? "border-orange-500" :
              "border-[var(--color-accent-amber)]"
            )} />
            <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-[var(--color-text-primary)]">{event.name}</span>
                <SeverityBadge severity={event.severity} />
              </div>
              <div className="text-xs text-[var(--color-text-muted)]">
                Target: {event.target} {event.block && <>• Block #{event.block.toLocaleString()}</>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
