"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FolderGit2,
  Search,
  ShieldAlert,
  FileText,
  Users,
  Activity,
  Settings,
  ArrowLeft,
  X,
  Shield,
} from "lucide-react";

const adminNavItems = [
  { label: "Overview", href: "/admin/overview", icon: LayoutDashboard },
  { label: "Projects", href: "/admin/projects", icon: FolderGit2 },
  { label: "Findings", href: "/admin/findings", icon: ShieldAlert },
  { label: "Scanner Runs", href: "/admin/scans", icon: Search },
  { label: "Report Pipeline", href: "/admin/reports", icon: FileText },
  { label: "Clients", href: "/admin/clients", icon: Users },
  { label: "Lab Attacks", href: "/admin/lab-runs", icon: Activity },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full w-64 bg-[#0a0a0f] border-r border-white/5 flex flex-col transition-transform duration-200 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-4 h-14 border-b border-white/5">
          <Link href="/admin/overview" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              CryptoSec Admin
            </span>
          </Link>
          <button
            onClick={onClose}
            aria-label="Close navigation"
            className="lg:hidden p-1 rounded hover:bg-white/5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div className="px-4 py-2 mt-4">
          <div className="text-[10px] font-bold tracking-wider text-indigo-400/80 uppercase">
            Consulting Portal
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {adminNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href === "/admin/overview" && pathname === "/admin");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all group",
                  isActive
                    ? "bg-indigo-500/10 text-white border-l-2 border-indigo-500 font-medium"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0 transition-transform group-hover:scale-105",
                    isActive ? "text-indigo-400" : "text-slate-400 group-hover:text-slate-300"
                  )}
                />
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="admin-sidebar-active"
                    className="ml-auto w-1 h-3 rounded-full bg-indigo-500"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/5 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-2 justify-center w-full px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Exit to Lab Simulator
          </Link>
          <div className="px-3 py-2 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
            <p className="text-[10px] font-bold text-indigo-400 tracking-wide">
              PRO CONSULTING MODE
            </p>
            <p className="text-[9px] text-slate-400 mt-0.5 leading-relaxed">
              Managing simulated audits and findings database.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
