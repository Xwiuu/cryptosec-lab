"use client";

import { useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";
import { ShieldAlert } from "lucide-react";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-100 flex flex-col font-sans">
      {/* Sidebar */}
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-h-screen">
        {/* Topbar */}
        <AdminTopbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Content Wrapper */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-20 space-y-6">
          {/* Global Admin Security Notice Banner */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold text-indigo-200">Demo Administrative Mode:</strong> This console is a simulation for portfolio display and educational purposes. No real client metadata or mainnet transactions are processed.
            </div>
          </div>

          {children}
        </main>

        {/* Footer */}
        <footer className="mt-auto border-t border-white/5 py-4 px-6 text-center text-slate-500 text-xs bg-[#0a0a0f]">
          <p>© 2026 CryptoSec Lab. Educational Web3 Security Audit Simulator. No real audits are performed.</p>
        </footer>
      </div>
    </div>
  );
}
