"use client";

import { useState } from "react";
import { Link2, BugPlay, CheckCircle, XCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { HashDisplay } from "@/components/ui/HashDisplay";
import { AddressDisplay } from "@/components/ui/AddressDisplay";
import { WarningCallout } from "@/components/ui/WarningCallout";
import { Drawer } from "@/components/ui/Drawer";
import { SecurityNotice } from "@/components/ui/SecurityNotice";
import { blocks, chainMetrics, validationResult, forks, tamperedBlock } from "@/data/chain";

type BlockRow = (typeof blocks)[number] | typeof tamperedBlock;

const blockColumns: Column<BlockRow>[] = [
  { key: "index", label: "Block", className: "w-20 font-mono" },
  { key: "hash", label: "Hash", render: (b) => <HashDisplay hash={b.hash} /> },
  { key: "timestamp", label: "Time", render: (b) => <span className="text-xs">{new Date(b.timestamp * 1000).toLocaleString()}</span> },
  { key: "txCount", label: "TXs", className: "w-16 text-center" },
  { key: "difficulty", label: "Diff", className: "w-16 text-center" },
  { key: "status", label: "Status", render: (b) => (
    <span className={`text-xs font-medium ${b.status === "valid" ? "text-[var(--color-accent-green)]" : b.status === "tampered" ? "text-[var(--color-accent-red)]" : "text-[var(--color-accent-amber)]"}`}>
      {b.status}
    </span>
  )},
  { key: "riskFlags", label: "Risk", render: (b) => b.riskFlags.length > 0 ? <SeverityBadge severity="critical" /> : <span className="text-xs text-[var(--color-text-muted)]">-</span> },
];

export default function ChainPage() {
  const [showTampered, setShowTampered] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<BlockRow | null>(null);
  const [validationStatus, setValidationStatus] = useState<"passed" | "failed" | null>(null);
  const displayBlocks = showTampered ? [...blocks.slice(0, 12), tamperedBlock, ...blocks.slice(12)] : blocks;

  const validateChain = () => {
    setValidationStatus(showTampered ? "failed" : "passed");
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Chain Explorer" description="Explore blocks, transactions, and chain health" icon={Link2} />
      <SecurityNotice message="Local simulation only. No mainnet connection. No real transactions are read or broadcast." />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard label="Total Blocks" value={chainMetrics.totalBlocks.toLocaleString()} icon={Link2} />
        <MetricCard label="Total TXs" value={chainMetrics.totalTransactions.toLocaleString()} icon={Link2} />
        <MetricCard label="Avg Block Time" value={`${chainMetrics.averageBlockTime}s`} />
        <MetricCard label="Difficulty" value={chainMetrics.currentDifficulty} />
        <MetricCard label="Validators" value={`${chainMetrics.activeValidators}/${chainMetrics.totalValidators}`} />
        <MetricCard label="Epoch" value={chainMetrics.epoch} />
      </div>

      {validationStatus === "passed" && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--color-accent-green-bg)] border border-[var(--color-accent-green)]/30">
          <CheckCircle className="w-5 h-5 mt-0.5 text-[var(--color-accent-green)] shrink-0" />
          <div>
            <p className="text-sm font-medium text-[var(--color-text-primary)]">Chain Validation Passed</p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">All visible local blocks link correctly in the baseline simulation.</p>
          </div>
        </div>
      )}

      {validationStatus === "failed" && (
        <WarningCallout
          title="Chain Validation Failed"
          description={validationResult.errors.join(". ")}
          type="critical"
        />
      )}

      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border-primary)]">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Recent Blocks</h2>
          <div className="flex flex-wrap justify-end gap-2">
            <button
              onClick={validateChain}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--color-accent-blue-bg)] text-[var(--color-accent-blue)] border border-[var(--color-accent-blue)]/30 hover:bg-[var(--color-accent-blue)]/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-blue)]"
            >
              <CheckCircle className="w-3 h-3" />
              Validate Chain
            </button>
            <button
              onClick={() => {
                setShowTampered(!showTampered);
                setValidationStatus(null);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--color-accent-red-bg)] text-[var(--color-accent-red)] border border-[var(--color-accent-red)]/30 hover:bg-[var(--color-accent-red)]/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-red)]"
            >
              <BugPlay className="w-3 h-3" />
              {showTampered ? "Hide Tampering" : "Simulate Chain Tampering"}
            </button>
          </div>
        </div>
        <DataTable columns={blockColumns} data={displayBlocks.slice(0, 20)} onRowClick={setSelectedBlock} />
      </div>

      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl p-4">
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">Chain Forks</h2>
        <div className="space-y-3">
          {forks.map((fork) => (
            <div key={fork.id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-3 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-[var(--color-text-primary)]">Fork #{fork.id}</span>
                  {fork.isValid ? <CheckCircle className="w-3.5 h-3.5 text-[var(--color-accent-green)]" /> : <XCircle className="w-3.5 h-3.5 text-[var(--color-accent-red)]" />}
                </div>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Blocks {fork.startBlock} → {fork.endBlock} • {fork.blocks.length} blocks • Created by {fork.createdBy}</p>
              </div>
              <span className="text-[10px] text-[var(--color-text-muted)] sm:text-right">{new Date(fork.timestamp).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      <Drawer open={!!selectedBlock} onClose={() => setSelectedBlock(null)} title={`Block #${selectedBlock?.index || ""}`}>
        {selectedBlock && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-xs text-[var(--color-text-muted)]">Hash</span><HashDisplay hash={selectedBlock.hash} chars={16} /></div>
              <div className="flex justify-between"><span className="text-xs text-[var(--color-text-muted)]">Previous Hash</span><HashDisplay hash={selectedBlock.previousHash} chars={16} /></div>
              <div className="flex justify-between"><span className="text-xs text-[var(--color-text-muted)]">Timestamp</span><span className="text-xs font-mono text-[var(--color-text-secondary)]">{new Date(selectedBlock.timestamp * 1000).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-xs text-[var(--color-text-muted)]">Miner</span><AddressDisplay address={selectedBlock.miner} showCopy /></div>
              <div className="flex justify-between"><span className="text-xs text-[var(--color-text-muted)]">Nonce</span><span className="text-xs font-mono text-[var(--color-text-secondary)]">{selectedBlock.nonce}</span></div>
              <div className="flex justify-between"><span className="text-xs text-[var(--color-text-muted)]">Difficulty</span><span className="text-xs font-mono text-[var(--color-text-secondary)]">{selectedBlock.difficulty}</span></div>
              <div className="flex justify-between"><span className="text-xs text-[var(--color-text-muted)]">TX Count</span><span className="text-xs font-mono text-[var(--color-text-secondary)]">{selectedBlock.txCount}</span></div>
              <div className="flex justify-between"><span className="text-xs text-[var(--color-text-muted)]">Status</span><span className={`text-xs font-medium ${selectedBlock.status === "valid" ? "text-[var(--color-accent-green)]" : "text-[var(--color-accent-red)]"}`}>{selectedBlock.status}</span></div>
              {selectedBlock.riskFlags.length > 0 && (
                <div className="flex justify-between"><span className="text-xs text-[var(--color-text-muted)]">Risk Flags</span><div className="flex gap-1">{selectedBlock.riskFlags.map((f: string) => <SeverityBadge key={f} severity="critical" />)}</div></div>
              )}
            </div>
            {selectedBlock.transactions.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-[var(--color-text-primary)] mb-2">Transactions</h3>
                <div className="space-y-1">
                  {selectedBlock.transactions.map((tx: string) => (
                    <div key={tx} className="p-2 rounded bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)]">
                      <HashDisplay hash={tx} chars={16} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
