"use client";

import { useState } from "react";
import { Server, Wifi, Activity, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { WarningCallout } from "@/components/ui/WarningCallout";
import { SecurityNotice } from "@/components/ui/SecurityNotice";
import { networkNodes, nodeSummary } from "@/data/nodes";
import type { NodeInfo } from "@/types/blockchain";

type NodeRow = NodeInfo;

const nodeColumns: Column<NodeRow>[] = [
  { key: "name", label: "Node" },
  { key: "type", label: "Type", render: (n) => <span className={`text-xs font-medium ${n.type === "attacker" ? "text-[var(--color-accent-red)]" : n.type === "validator" ? "text-[var(--color-accent-blue)]" : n.type === "offline" ? "text-[var(--color-text-muted)]" : "text-[var(--color-accent-green)]"}`}>{n.type}</span> },
  { key: "status", label: "Status", render: (n) => (
    <span className={`inline-flex items-center gap-1 text-xs ${n.status === "online" ? "text-[var(--color-accent-green)]" : n.status === "syncing" ? "text-[var(--color-accent-amber)]" : "text-[var(--color-accent-red)]"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${n.status === "online" ? "bg-[var(--color-accent-green)]" : n.status === "syncing" ? "bg-[var(--color-accent-amber)]" : "bg-[var(--color-accent-red)]"}`} />
      {n.status}
    </span>
  )},
  { key: "chain", label: "Chain", render: (n) => <span className="text-xs font-mono">#{n.chain.toLocaleString()}</span> },
  { key: "peers", label: "Peers", className: "text-center" },
  { key: "latency", label: "Latency", render: (n) => <span className="text-xs font-mono">{n.latency}ms</span> },
  { key: "stake", label: "Stake", render: (n) => n.stake > 0 ? <span className="text-xs font-mono">{(n.stake).toLocaleString()}</span> : <span className="text-xs text-[var(--color-text-muted)]">-</span> },
];

export default function NodesPage() {
  const [selectedNode, setSelectedNode] = useState<NodeRow | null>(null);
  const [showPartition, setShowPartition] = useState(false);

  const onlineCount = networkNodes.filter(n => n.status === "online").length;
  const attackerCount = networkNodes.filter(n => n.type === "attacker").length;

  return (
    <div className="space-y-6">
      <PageHeader title="Network Nodes" description="Monitor nodes, validators, and network topology" icon={Server} />
      <SecurityNotice message="Local simulation only. Node status, peers, and partitions are mock data with no mainnet connection." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Total Nodes" value={networkNodes.length} icon={Server} />
        <MetricCard label="Online" value={onlineCount} icon={Wifi} severity={onlineCount >= 8 ? "low" : "high"} />
        <MetricCard label="Validators" value={nodeSummary.validators} icon={Activity} />
        <MetricCard label="Attackers" value={attackerCount} icon={AlertTriangle} severity={attackerCount > 0 ? "critical" : "low"} />
      </div>

      {attackerCount > 0 && (
        <WarningCallout title="Malicious Nodes Detected" description={`${attackerCount} node(s) flagged as attacker/sybil. Potential chain fork or network partition risk.`} type="critical" />
      )}

      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl">
        <div className="px-4 py-3 border-b border-[var(--color-border-primary)]">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Node List</h2>
        </div>
        <DataTable columns={nodeColumns} data={networkNodes} onRowClick={setSelectedNode} />
      </div>

      {selectedNode && (
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl p-4">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">{selectedNode.name} — Details</h2>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div><span className="text-[var(--color-text-muted)]">ID: </span><span className="font-mono text-[var(--color-text-secondary)]">{selectedNode.id}</span></div>
            <div><span className="text-[var(--color-text-muted)]">Version: </span><span className="font-mono text-[var(--color-text-secondary)]">{selectedNode.version}</span></div>
            <div><span className="text-[var(--color-text-muted)]">Chain: </span><span className="font-mono text-[var(--color-text-secondary)]">#{selectedNode.chain.toLocaleString()}</span></div>
            <div><span className="text-[var(--color-text-muted)]">Blocks: </span><span className="font-mono text-[var(--color-text-secondary)]">{selectedNode.blocks.toLocaleString()}</span></div>
            <div><span className="text-[var(--color-text-muted)]">Peers: </span><span className="font-mono text-[var(--color-text-secondary)]">{selectedNode.peers}</span></div>
            <div><span className="text-[var(--color-text-muted)]">Latency: </span><span className="font-mono text-[var(--color-text-secondary)]">{selectedNode.latency}ms</span></div>
          </div>
        </div>
      )}

      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Network Simulation</h2>
          <button onClick={() => setShowPartition(!showPartition)} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--color-accent-amber-bg)] text-[var(--color-accent-amber)] border border-[var(--color-accent-amber)]/30 hover:bg-amber-500/20 transition-colors">
            {showPartition ? "Reset Network" : "Simulate Partition"}
          </button>
        </div>
        {showPartition && (
          <WarningCallout title="Network Partition Detected" description="Attacker nodes have split from main chain. 4 nodes on fork #184712. Chain reorg risk: HIGH." type="critical" />
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mt-3">
          {networkNodes.map((n) => (
            <div key={n.id} className={`p-2 rounded-lg border text-center ${n.type === "attacker" ? "border-[var(--color-accent-red)]/30 bg-[var(--color-accent-red-bg)]" : n.status === "offline" ? "border-[var(--color-text-muted)]/20 bg-[var(--color-bg-primary)]" : n.type === "validator" ? "border-[var(--color-accent-blue)]/30 bg-[var(--color-accent-blue-bg)]" : "border-[var(--color-border-primary)] bg-[var(--color-bg-primary)]"}`}>
              <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${n.status === "online" ? "bg-[var(--color-accent-green)]" : n.status === "syncing" ? "bg-[var(--color-accent-amber)]" : "bg-[var(--color-accent-red)]"}`} />
              <div className="text-[9px] font-medium text-[var(--color-text-secondary)] truncate">{n.name}</div>
              <div className="text-[8px] text-[var(--color-text-muted)]">{n.type}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
