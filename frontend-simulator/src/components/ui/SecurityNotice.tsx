"use client";

import { cn } from "@/lib/utils";
import { ShieldCheck } from "lucide-react";

export function SecurityNotice({ message, className }: { message: string; className?: string }) {
  return (
    <div role="note" className={cn("flex items-start gap-2 px-3 py-2 bg-[var(--color-accent-blue-bg)] border border-[var(--color-accent-blue)]/30 rounded-lg", className)}>
      <ShieldCheck aria-hidden="true" className="w-4 h-4 mt-0.5 text-[var(--color-accent-blue)] shrink-0" />
      <span className="text-xs leading-relaxed text-[var(--color-accent-blue)]">{message}</span>
    </div>
  );
}
