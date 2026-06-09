"use client";

import { cn } from "@/lib/utils";
import { Shield, ShieldOff } from "lucide-react";
import { useLabStore } from "@/store/labStore";

export function ModeToggle({ className }: { className?: string }) {
  const { simulationMode, toggleSecureMode } = useLabStore();
  const isSecure = simulationMode === "secure";
  return (
    <button
      onClick={toggleSecureMode}
      className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border", isSecure ? "bg-[var(--color-accent-green-bg)] border-[var(--color-accent-green)]/30 text-[var(--color-accent-green)]" : "bg-[var(--color-accent-red-bg)] border-[var(--color-accent-red)]/30 text-[var(--color-accent-red)]", className)}
    >
      {isSecure ? <Shield className="w-3.5 h-3.5" /> : <ShieldOff className="w-3.5 h-3.5" />}
      {isSecure ? "Secure Mode" : "Vulnerable Mode"}
    </button>
  );
}
