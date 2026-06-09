"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileCode, Shield } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ContractCodeViewer } from "@/components/ui/ContractCodeViewer";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { SecurityNotice } from "@/components/ui/SecurityNotice";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { WarningCallout } from "@/components/ui/WarningCallout";
import { contractsList } from "@/data/contracts";

type ContractRow = (typeof contractsList)[number];

const contractColumns: Column<ContractRow>[] = [
  { key: "name", label: "Contract", render: (c) => <span className="text-xs font-medium text-[var(--color-text-primary)]">{c.name}</span> },
  { key: "variant", label: "Type", render: (c) => <span className={`text-xs font-medium ${c.variant === "vulnerable" ? "text-[var(--color-accent-red)]" : "text-[var(--color-accent-green)]"}`}>{c.variant}</span> },
  { key: "category", label: "Category", render: (c) => <span className="text-xs capitalize text-[var(--color-text-secondary)]">{c.category}</span> },
  { key: "vulnerability", label: "Vulnerability", render: (c) => c.vulnerability ? <SeverityBadge severity={c.severity || "info"} /> : <span className="text-xs text-[var(--color-accent-green)]">Protected</span> },
  { key: "testFile", label: "Test", render: (c) => <span className="text-xs text-[var(--color-text-muted)]">{c.testFile}</span> },
];

export default function ContractsPage() {
  const [selectedContract, setSelectedContract] = useState<ContractRow>(contractsList[0]);
  return (
    <div className="space-y-6">
      <PageHeader title="Smart Contract Lab" description="Analyze vulnerable and secure Solidity contracts" icon={FileCode} />
      <SecurityNotice message="Local simulation only. No mainnet connection. Educational lab exploits only; do not execute exploit steps against third-party systems." />

      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl">
        <div className="px-4 py-3 border-b border-[var(--color-border-primary)]">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Contract Library</h2>
        </div>
        <DataTable columns={contractColumns} data={contractsList} onRowClick={setSelectedContract} />
      </div>

      {selectedContract && (
        <motion.div key={selectedContract.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">{selectedContract.name}</h2>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">{selectedContract.description}</p>
              </div>
              <div className="flex items-center gap-2">
                {selectedContract.severity && <SeverityBadge severity={selectedContract.severity} />}
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${selectedContract.variant === "vulnerable" ? "bg-[var(--color-accent-red-bg)] text-[var(--color-accent-red)]" : "bg-[var(--color-accent-green-bg)] text-[var(--color-accent-green)]"}`}>{selectedContract.variant}</span>
              </div>
            </div>
          </div>

          <ContractCodeViewer code={selectedContract.source} language="solidity" highlightLines={selectedContract.highlightLines} />

          {selectedContract.vulnerability && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl p-4">
                <h3 className="text-xs font-semibold text-[var(--color-accent-red)] mb-2">Exploit Steps</h3>
                <WarningCallout
                  title="Educational Exploit Scenario"
                  description="These steps are for local simulation only. Do not run them against systems you do not own or have explicit permission to test."
                  type="critical"
                  className="mb-3"
                />
                <ol className="list-decimal list-inside space-y-1">
                  {selectedContract.exploitSteps.map((step: string, i: number) => (
                    <li key={i} className="text-xs text-[var(--color-text-secondary)]">{step}</li>
                  ))}
                </ol>
              </div>
              <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl p-4">
                <h3 className="text-xs font-semibold text-[var(--color-accent-green)] mb-2">Mitigation</h3>
                <p className="text-xs text-[var(--color-text-secondary)]">{selectedContract.mitigation}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 p-3 rounded-lg bg-[var(--color-accent-blue-bg)] border border-[var(--color-accent-blue)]/30">
            <Shield className="w-4 h-4 text-[var(--color-accent-blue)]" />
            <span className="text-xs text-[var(--color-accent-blue)]">Test file: {selectedContract.testFile}</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
