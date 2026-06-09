"use client";

import { cn } from "@/lib/utils";
import { shortenHash } from "@/lib/utils";

export function HashDisplay({ hash, chars, className }: { hash: string; chars?: number; className?: string }) {
  return (
    <span className={cn("font-mono text-xs text-[var(--color-text-secondary)]", className)} title={hash}>
      {shortenHash(hash, chars)}
    </span>
  );
}
