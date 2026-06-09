"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Copy, Check } from "lucide-react";

export function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };
  return (
    <button onClick={handleCopy} className={cn("p-1 rounded hover:bg-[var(--color-bg-card-hover)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-blue)]", className)} title="Copy to clipboard" aria-label="Copy to clipboard">
      {copied ? <Check className="w-3.5 h-3.5 text-[var(--color-accent-green)]" /> : <Copy className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />}
    </button>
  );
}
