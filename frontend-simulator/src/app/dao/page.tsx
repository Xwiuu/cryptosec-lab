"use client";

import { useState } from "react";
import { Vote, Users, FileText, Clock, Shield, Wallet } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { WarningCallout } from "@/components/ui/WarningCallout";
import { ModeToggle } from "@/components/ui/ModeToggle";
import { SecurityNotice } from "@/components/ui/SecurityNotice";
import { daoProposals, daoState } from "@/data/dao";
import { useLabStore } from "@/store/labStore";
import type { Proposal } from "@/types/dao";

type ProposalRow = Proposal;

const proposalColumns: Column<ProposalRow>[] = [
  { key: "title", label: "Proposal", render: (p) => <span className="text-xs font-medium text-[var(--color-text-primary)]">{p.title}</span> },
  { key: "proposer", label: "Proposer", render: (p) => <span className="text-xs font-mono text-[var(--color-text-secondary)]">{p.proposer}</span> },
  { key: "status", label: "Status", render: (p) => <span className={`text-xs font-medium ${p.status === "active" ? "text-[var(--color-accent-green)]" : p.status === "executed" ? "text-[var(--color-accent-blue)]" : p.status === "defeated" ? "text-[var(--color-accent-red)]" : "text-[var(--color-accent-amber)]"}`}>{p.status}</span> },
  { key: "forVotes", label: "For", render: (p) => <span className="text-xs font-mono">{(p.forVotes / 1_000_000).toFixed(1)}M</span> },
  { key: "againstVotes", label: "Against", render: (p) => <span className="text-xs font-mono">{(p.againstVotes / 1_000_000).toFixed(1)}M</span> },
  { key: "quorumReached", label: "Quorum", render: (p) => p.quorumReached ? <span className="text-xs text-[var(--color-accent-green)]">Reached</span> : <span className="text-xs text-[var(--color-accent-red)]">Not met</span> },
];

export default function DaoPage() {
  const { simulationMode } = useLabStore();
  const [selectedProposal, setSelectedProposal] = useState<ProposalRow | null>(null);
  const [simulateAttack, setSimulateAttack] = useState(false);

  const maliciousProposal = daoProposals.find(p => p.id === "prop-3");
  const attackBlocked = simulationMode === "secure" && simulateAttack;
  const treasuryBalance = simulateAttack && !attackBlocked ? 0 : daoState.treasuryBalance;

  return (
    <div className="space-y-6">
      <PageHeader title="DAO Governance" description="Proposals, voting, and governance attack simulations" icon={Vote} actions={<ModeToggle />} />
      <SecurityNotice message="Local simulation only. No real governance votes, treasury transfers, or mainnet connection are performed." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Total Proposals" value={daoState.totalProposals} icon={FileText} />
        <MetricCard label="Active" value={daoState.activeProposals} icon={Clock} severity={daoState.activeProposals > 5 ? "high" : "info"} />
        <MetricCard label="Total Voters" value={daoState.totalVoters.toLocaleString()} icon={Users} />
        <MetricCard label="Treasury" value={`$${(treasuryBalance / 1_000_000).toFixed(1)}M`} icon={Wallet} severity={treasuryBalance === 0 ? "critical" : "info"} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Total Delegated" value={`${(daoState.totalDelegated / 1_000_000).toFixed(1)}M`} />
        <MetricCard label="Quorum %" value={`${daoState.quorumPercentage}%`} severity={daoState.quorumPercentage < 5 ? "high" : "info"} />
        <MetricCard label="Proposal Threshold" value={daoState.proposalThreshold.toLocaleString()} />
        <MetricCard label="Timelock" value={`${daoState.timelockDelay / 86400}d`} />
      </div>

      {maliciousProposal && (
        <WarningCallout title="Suspicious Proposal Detected" description={`"${maliciousProposal.title}" by ${maliciousProposal.proposer}. Check for flash loan attack or low quorum exploitation.`} type="critical" />
      )}

      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl">
        <div className="px-4 py-3 border-b border-[var(--color-border-primary)]"><h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Proposals</h2></div>
        <DataTable columns={proposalColumns} data={daoProposals} onRowClick={setSelectedProposal} />
      </div>

      {selectedProposal && (
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl p-4 space-y-3">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">{selectedProposal.title}</h2>
          <p className="text-xs text-[var(--color-text-secondary)]">{selectedProposal.description}</p>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div><span className="text-[var(--color-text-muted)]">Proposer: </span><span className="font-mono text-[var(--color-text-secondary)]">{selectedProposal.proposer}</span></div>
            <div><span className="text-[var(--color-text-muted)]">Status: </span><span className="font-medium">{selectedProposal.status}</span></div>
            <div><span className="text-[var(--color-text-muted)]">For: </span><span className="font-mono text-[var(--color-accent-green)]">{selectedProposal.forVotes.toLocaleString()}</span></div>
            <div><span className="text-[var(--color-text-muted)]">Against: </span><span className="font-mono text-[var(--color-accent-red)]">{selectedProposal.againstVotes.toLocaleString()}</span></div>
            <div><span className="text-[var(--color-text-muted)]">Quorum: </span><span className="font-mono">{selectedProposal.quorum.toLocaleString()}</span></div>
            <div><span className="text-[var(--color-text-muted)]">Timelock: </span><span className="font-mono">{selectedProposal.timelockDelay / 86400}d</span></div>
          </div>
        </div>
      )}

      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Governance Attack Simulation</h2>
          <button onClick={() => setSimulateAttack(!simulateAttack)} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--color-accent-red-bg)] text-[var(--color-accent-red)] border border-[var(--color-accent-red)]/30 hover:bg-red-500/20 transition-colors">
            {simulateAttack ? "Reset" : "Simulate Flash Loan Attack"}
          </button>
        </div>
        {!simulateAttack ? (
          <p className="text-xs text-[var(--color-text-muted)]">Click to simulate a flash loan governance attack. The attacker borrows a large amount of CSEC tokens, votes on a malicious proposal to drain the treasury, then repays the loan.</p>
        ) : (
          <div className="space-y-3">
            <WarningCallout
              title={attackBlocked ? "Governance Attack Blocked" : "Flash Loan Governance Attack"}
              description={attackBlocked
                ? "Attacker flash-loaned 5M CSEC tokens, but snapshot voting, quorum threshold, and timelock prevented execution."
                : "Attacker flash-loaned 5M CSEC tokens (58.8% of total supply). Voted for malicious proposal 'Drain Treasury'. Proposal passed with low quorum. Treasury drained."}
              type={attackBlocked ? "info" : "critical"}
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-[var(--color-accent-amber-bg)] border border-[var(--color-accent-amber)]/20"><span className="text-[var(--color-text-muted)] block mb-1">Flash Loan</span><span className="text-[var(--color-accent-amber)] font-mono">5,000,000 CSEC</span></div>
              <div className="p-3 rounded-lg bg-[var(--color-accent-red-bg)] border border-[var(--color-accent-red)]/20"><span className="text-[var(--color-text-muted)] block mb-1">Votes Acquired</span><span className="text-[var(--color-accent-red)] font-mono">58.8% of supply</span></div>
              <div className="p-3 rounded-lg bg-[var(--color-accent-green-bg)] border border-[var(--color-accent-green)]/20"><span className="text-[var(--color-text-muted)] block mb-1">{attackBlocked ? "Execution" : "Drained"}</span><span className="text-[var(--color-accent-green)] font-mono">{attackBlocked ? "Blocked" : "$12.5M treasury"}</span></div>
            </div>
            {attackBlocked && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--color-accent-green-bg)] border border-[var(--color-accent-green)]/30">
                <Shield className="w-3.5 h-3.5 text-[var(--color-accent-green)]" />
                <span className="text-[10px] text-[var(--color-accent-green)]">Secure mode prevented: snapshot-based voting + timelock + quorum threshold blocked the malicious proposal.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
