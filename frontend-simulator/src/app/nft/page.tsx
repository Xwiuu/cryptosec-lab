"use client";

import { useState } from "react";
import { Image, Palette, Shield } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { WarningCallout } from "@/components/ui/WarningCallout";
import { ModeToggle } from "@/components/ui/ModeToggle";
import { SecurityNotice } from "@/components/ui/SecurityNotice";
import { nftCollections, nftItems, nftRisks } from "@/data/nft";
import { useLabStore } from "@/store/labStore";

type NftRow = (typeof nftItems)[number];

const nftColumns: Column<NftRow>[] = [
  { key: "name", label: "NFT", render: (n) => <span className="text-xs font-medium text-[var(--color-text-primary)]">{n.name}</span> },
  { key: "collection", label: "Collection", render: (n) => <span className="text-xs text-[var(--color-text-secondary)]">{n.collection}</span> },
  { key: "owner", label: "Owner", render: (n) => <span className="text-xs font-mono text-[var(--color-text-secondary)]">{n.owner}</span> },
  { key: "isFrozen", label: "Frozen", render: (n) => n.isFrozen ? <span className="text-xs text-[var(--color-accent-green)]">Frozen</span> : <span className="text-xs text-[var(--color-accent-red)]">Mutable</span> },
  { key: "royalty", label: "Royalty", render: (n) => <span className="text-xs font-mono">{n.royalty}%</span> },
  { key: "supplyCap", label: "Max Supply", render: (n) => <span className="text-xs font-mono">{n.supplyCap.toLocaleString()}</span> },
];

export default function NftPage() {
  const { simulationMode } = useLabStore();
  const [selectedNft, setSelectedNft] = useState<NftRow | null>(null);
  const [showManipulation, setShowManipulation] = useState(false);
  const manipulationBlocked = simulationMode === "secure" && showManipulation;

  return (
    <div className="space-y-6">
      <PageHeader title="NFT Lab" description="Mint, metadata, marketplace risks, and royalty manipulation" icon={Image} actions={<ModeToggle />} />
      <SecurityNotice message="Local simulation only. NFT metadata, mints, listings, and ownership are mock data with no mainnet connection." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Collections" value={nftCollections.length} icon={Palette} />
        <MetricCard label="Total Minted" value={nftItems.length} />
        <MetricCard label="Max Supply" value={nftCollections.reduce((a, c) => a + c.maxSupply, 0).toLocaleString()} />
        <MetricCard label="Vulnerable" value={nftCollections.filter(c => c.isVulnerable).length} severity="high" />
      </div>

      {nftCollections.filter(c => c.isVulnerable).length > 0 && (
        <WarningCallout title="Vulnerable NFT Collection Detected" description="CryptoSec Guardians collection has mutable metadata. Owner can change metadata after mint. Risk of metadata manipulation." type="critical" />
      )}

      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl">
        <div className="px-4 py-3 border-b border-[var(--color-border-primary)]"><h2 className="text-sm font-semibold text-[var(--color-text-primary)]">NFT Items</h2></div>
        <DataTable columns={nftColumns} data={nftItems} onRowClick={setSelectedNft} />
      </div>

      {selectedNft && (
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl p-4 space-y-3">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">{selectedNft.name}</h2>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div><span className="text-[var(--color-text-muted)]">Token ID: </span><span className="font-mono">#{selectedNft.tokenId}</span></div>
            <div><span className="text-[var(--color-text-muted)]">Collection: </span><span>{selectedNft.collection}</span></div>
            <div><span className="text-[var(--color-text-muted)]">Owner: </span><span className="font-mono">{selectedNft.owner}</span></div>
            <div><span className="text-[var(--color-text-muted)]">Royalty: </span><span className="font-mono">{selectedNft.royalty}%</span></div>
          </div>
          <div className="text-xs"><span className="text-[var(--color-text-muted)]">Metadata attributes: </span>{selectedNft.metadata.attributes.map((a) => `${a.trait_type}: ${a.value}`).join(", ")}</div>
          {selectedNft.metadata.isManipulated && <SeverityBadge severity="high" />}
        </div>
      )}

      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Metadata Manipulation Simulator</h2>
          <button onClick={() => setShowManipulation(!showManipulation)} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--color-accent-red-bg)] text-[var(--color-accent-red)] border border-[var(--color-accent-red)]/30 hover:bg-red-500/20 transition-colors">
            {showManipulation ? "Reset" : "Manipulate Metadata"}
          </button>
        </div>
        {showManipulation && (
          <div>
            <WarningCallout
              title={manipulationBlocked ? "Metadata Change Blocked" : "Metadata Manipulated"}
              description={manipulationBlocked
                ? "Secure mode froze metadata. The attempted rarity and image URI change was rejected."
                : "Guardian #0002 metadata altered by owner after mint. Rarity changed from 'Rare' to 'Legendary'. Image URI replaced."}
              type={manipulationBlocked ? "info" : "critical"}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-xs">
              <div className="p-3 rounded-lg bg-[var(--color-accent-green-bg)] border border-[var(--color-accent-green)]/20">
                <span className="text-[var(--color-accent-green)] block mb-1">Before (Secure)</span>
                <ul className="text-[var(--color-text-muted)] space-y-0.5"><li>Rarity: Rare</li><li>Image: ipfs://QmX... (frozen)</li></ul>
              </div>
              <div className="p-3 rounded-lg bg-[var(--color-accent-red-bg)] border border-[var(--color-accent-red)]/20">
                <span className="text-[var(--color-accent-red)] block mb-1">{manipulationBlocked ? "Attempted Change" : "After (Vulnerable)"}</span>
                <ul className="text-[var(--color-text-muted)] space-y-0.5"><li>Rarity: Legendary</li><li>Image: https://attacker.com/... ({manipulationBlocked ? "blocked" : "changed"})</li></ul>
              </div>
            </div>
            {manipulationBlocked && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-[var(--color-accent-green)]/30 bg-[var(--color-accent-green-bg)] p-2">
                <Shield className="h-3.5 w-3.5 text-[var(--color-accent-green)]" />
                <span className="text-[10px] text-[var(--color-accent-green)]">Freeze protection blocked metadata mutation.</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        {nftRisks.map((risk) => (
          <div key={risk.id} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-primary)]">
            <SeverityBadge severity={risk.severity} />
            <div>
              <span className="text-xs font-medium text-[var(--color-text-primary)]">{risk.name}</span>
              <p className="text-xs text-[var(--color-text-muted)]">{risk.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
