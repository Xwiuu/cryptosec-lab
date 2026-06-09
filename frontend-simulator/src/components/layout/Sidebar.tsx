"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Link2, Wallet, Timer, Pickaxe, Server, Coins, FileCode, ShieldAlert,
  BarChart3, ArrowLeftRight, HandCoins, DollarSign, Vote, Image, GitCompareArrows,
  Search, FileText, BookOpen, Settings, X,
} from "lucide-react";

const navGroups = [
  {
    label: "Core Lab",
    items: [
      { label: "Dashboard", href: "/", icon: LayoutDashboard },
      { label: "Chain", href: "/chain", icon: Link2 },
      { label: "Wallet", href: "/wallet", icon: Wallet },
      { label: "Mempool", href: "/mempool", icon: Timer },
      { label: "Mining", href: "/mining", icon: Pickaxe },
      { label: "Nodes", href: "/nodes", icon: Server },
    ],
  },
  {
    label: "Web3 Lab",
    items: [
      { label: "Tokens", href: "/tokens", icon: Coins },
      { label: "Contracts", href: "/contracts", icon: FileCode },
      { label: "Vulnerabilities", href: "/vulnerabilities", icon: ShieldAlert },
    ],
  },
  {
    label: "DeFi Lab",
    items: [
      { label: "DeFi", href: "/defi", icon: BarChart3 },
      { label: "DEX", href: "/dex", icon: ArrowLeftRight },
      { label: "Lending", href: "/lending", icon: HandCoins },
      { label: "Stablecoin", href: "/stablecoin", icon: DollarSign },
      { label: "DAO", href: "/dao", icon: Vote },
      { label: "NFT", href: "/nft", icon: Image },
      { label: "Bridge", href: "/bridge", icon: GitCompareArrows },
    ],
  },
  {
    label: "Audit Lab",
    items: [
      { label: "Scanner", href: "/scanner", icon: Search },
      { label: "Audit Builder", href: "/audit", icon: FileText },
      { label: "Reports", href: "/reports", icon: BookOpen },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={onClose} aria-hidden="true" />}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full w-64 bg-[var(--color-sidebar-bg)] border-r border-[var(--color-sidebar-border)] flex flex-col transition-transform duration-200 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-4 h-14 border-b border-[var(--color-sidebar-border)]">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[var(--color-accent-blue)] flex items-center justify-center">
              <span className="text-xs font-bold text-white">CS</span>
            </div>
            <span className="text-sm font-semibold text-[var(--color-text-primary)]">CryptoSec Lab</span>
          </Link>
          <button onClick={onClose} aria-label="Close navigation" className="lg:hidden p-1 rounded hover:bg-[var(--color-sidebar-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-blue)]">
            <X className="w-4 h-4 text-[var(--color-text-muted)]" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-6">
          {navGroups.map((group) => (
            <div key={group.label}>
              <div className="px-2 mb-2 text-[10px] font-semibold tracking-widest uppercase text-[var(--color-text-muted)]">
                {group.label}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                        isActive
                          ? "bg-[var(--color-sidebar-active)] text-[var(--color-text-primary)] font-medium"
                          : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-sidebar-hover)]"
                      )}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {item.label}
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-active"
                          className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--color-accent-blue)]"
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="p-3 border-t border-[var(--color-sidebar-border)]">
          <div className="px-3 py-2 rounded-lg bg-[var(--color-accent-amber-bg)] border border-[var(--color-accent-amber)]/20">
            <p className="text-[10px] font-medium text-[var(--color-accent-amber)]">Local Simulation</p>
            <p className="text-[10px] text-[var(--color-text-muted)]">No mainnet connection</p>
          </div>
        </div>
      </aside>
    </>
  );
}
