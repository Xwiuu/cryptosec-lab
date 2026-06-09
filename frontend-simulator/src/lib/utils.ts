import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortenHash(hash: string, chars: number = 8): string {
  if (hash.length <= chars * 2 + 3) return hash;
  return `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}`;
}

export function shortenAddress(address: string, chars: number = 6): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatNumber(num: number, decimals: number = 2): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(decimals)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(decimals)}K`;
  return num.toFixed(decimals);
}

export function formatCurrency(num: number, decimals: number = 2): string {
  return `$${formatNumber(num, decimals)}`;
}

export function formatTimestamp(ts: number): string {
  return new Date(ts * 1000).toLocaleString();
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case "critical": return "text-severity-critical border-severity-critical bg-accent-red-bg";
    case "high": return "text-severity-high border-severity-high bg-amber-500/10";
    case "medium": return "text-severity-medium border-severity-medium bg-amber-500/5";
    case "low": return "text-severity-low border-severity-low bg-green-500/10";
    case "info": return "text-severity-info border-severity-info bg-blue-500/10";
    default: return "text-text-muted border-border-secondary bg-bg-card";
  }
}

export function getSeverityBg(severity: string): string {
  switch (severity) {
    case "critical": return "bg-accent-red-bg";
    case "high": return "bg-orange-500/10";
    case "medium": return "bg-amber-500/10";
    case "low": return "bg-green-500/10";
    case "info": return "bg-blue-500/10";
    default: return "bg-bg-card";
  }
}

export function getSeverityText(severity: string): string {
  switch (severity) {
    case "critical": return "text-accent-red";
    case "high": return "text-severity-high";
    case "medium": return "text-severity-medium";
    case "low": return "text-accent-green";
    case "info": return "text-accent-blue";
    default: return "text-text-secondary";
  }
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}
