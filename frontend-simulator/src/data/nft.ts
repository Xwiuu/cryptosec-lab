export const nftCollections = [
  {
    id: "nft-col-1",
    name: "CryptoSec Guardians",
    symbol: "CSG",
    totalSupply: 2500,
    maxSupply: 10000,
    owner: "0x7F3a...4a6",
    baseURI: "https://api.cryptosec.dev/metadata/",
    isFrozen: false,
    isVulnerable: true,
  },
  {
    id: "nft-col-2",
    name: "Secure Guardians",
    symbol: "SSG",
    totalSupply: 1500,
    maxSupply: 10000,
    owner: "0x7F3a...4a6",
    baseURI: "https://api.cryptosec.dev/secure-metadata/",
    isFrozen: true,
    isVulnerable: false,
  },
];

export const nftItems = [
  { id: "nft-1", tokenId: 1, name: "Guardian #0001", description: "The first CryptoSec Guardian", image: "/nft-placeholder-1.svg", metadata: { name: "Guardian #0001", description: "The first CryptoSec Guardian", image: "/nft-placeholder-1.svg", attributes: [{ trait_type: "Rarity", value: "Legendary" }, { trait_type: "Shield", value: "Titanium" }], isManipulated: false }, owner: "0x7F3a...4a6", collection: "CryptoSec Guardians", mintedAt: Date.now() - 86400_000 * 30, supplyCap: 10000, royalty: 5.0, isFrozen: false },
  { id: "nft-2", tokenId: 2, name: "Guardian #0002", description: "A rare CryptoSec Guardian", image: "/nft-placeholder-2.svg", metadata: { name: "Guardian #0002", description: "A rare CryptoSec Guardian", image: "/nft-placeholder-2.svg", attributes: [{ trait_type: "Rarity", value: "Rare" }, { trait_type: "Shield", value: "Steel" }], isManipulated: true }, owner: "0x1A2b...3c4", collection: "CryptoSec Guardians", mintedAt: Date.now() - 86400_000 * 25, supplyCap: 10000, royalty: 5.0, isFrozen: false },
  { id: "nft-3", tokenId: 1, name: "Secure Guardian #0001", description: "The first Secure Guardian", image: "/nft-placeholder-3.svg", metadata: { name: "Secure Guardian #0001", description: "The first Secure Guardian", image: "/nft-placeholder-3.svg", attributes: [{ trait_type: "Rarity", value: "Epic" }, { trait_type: "Shield", value: "Diamond" }], isManipulated: false }, owner: "0x3C4d...5e6f", collection: "Secure Guardians", mintedAt: Date.now() - 86400_000 * 15, supplyCap: 10000, royalty: 5.0, isFrozen: true },
];

export const nftRisks = [
  { id: "nftr-1", name: "Metadata Manipulation", severity: "high", description: "Base URI can be changed by owner after mint. Metadata not frozen.", collection: "CryptoSec Guardians" },
  { id: "nftr-2", name: "Order Replay", severity: "medium", description: "Marketplace orders lack nonce. Signed orders can be replayed.", collection: "CryptoSec Guardians" },
  { id: "nftr-3", name: "No Royalty Enforcement", severity: "high", description: "Marketplace does not enforce creator royalties on secondary sales.", collection: "CryptoSec Guardians" },
];
