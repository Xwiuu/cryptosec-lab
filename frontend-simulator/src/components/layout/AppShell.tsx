"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { StatusBar } from "./StatusBar";
import { AdminShell } from "../admin/AdminShell";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // If path starts with /admin, use the dedicated AdminShell layout
  if (pathname.startsWith("/admin")) {
    return <AdminShell>{children}</AdminShell>;
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 sm:p-6 pb-10">{children}</main>
      </div>
      <StatusBar />
    </div>
  );
}

