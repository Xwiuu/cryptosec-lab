"use client";

import { cn } from "@/lib/utils";
import { shortenAddress } from "@/lib/utils";
import { CopyButton } from "./CopyButton";

export function AddressDisplay({ address, chars, showCopy, className }: { address: string; chars?: number; showCopy?: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 font-mono text-xs text-[var(--color-text-secondary)]", className)} title={address}>
      {shortenAddress(address, chars)}
      {showCopy && <CopyButton text={address} />}
    </span>
  );
}
