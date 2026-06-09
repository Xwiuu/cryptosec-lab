export const demoWallet = {
  address: "0x7F3a9B2c...E8d1F4a6",
  publicKey: "0x04a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0",
  privateKey: "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  algorithm: "Ed25519",
  created: Date.now() - 86400_000 * 7,
  balance: 42.5,
  tokens: [
    { symbol: "ETH", name: "Ether (Simulated)", balance: 12.5, decimals: 18 },
    { symbol: "USDC", name: "USD Coin (Simulated)", balance: 15_000, decimals: 6 },
    { symbol: "CSEC", name: "CryptoSec Token", balance: 5_000, decimals: 18 },
    { symbol: "LINK", name: "ChainLink (Simulated)", balance: 500, decimals: 18 },
  ],
  riskFlags: ["seed_exposed", "weak_entropy"],
  isDemo: true,
};

export const seedPhraseDemo = {
  words: ["abandon", "ability", "able", "about", "above", "absent", "absorb", "abstract", "absurd", "abuse", "access", "accident"],
  isDemo: true,
  entropy: "0x00000000000000000000000000000000",
  length: 12,
};

export const walletActivities = [
  { id: "act-1", type: "send" as const, hash: "0x8a9b...c0d1", from: "0x7F3a...4a6", to: "0x1A2b...3c4", value: 2.5, token: "ETH", timestamp: Date.now() - 3600_000, status: "confirmed" as const, risk: null },
  { id: "act-2", type: "approve" as const, hash: "0x9b0c...d1e2", from: "0x7F3a...4a6", to: "0xBadD...A11c", value: 999_999, token: "USDC", timestamp: Date.now() - 7200_000, status: "confirmed" as const, risk: "malicious_dapp_approval" },
  { id: "act-3", type: "sign" as const, hash: "0xac1d...e2f3", from: "0x7F3a...4a6", to: "0x0bad...F00d", value: 0, token: "", timestamp: Date.now() - 10_800_000, status: "confirmed" as const, risk: "blind_signing" },
  { id: "act-4", type: "receive" as const, hash: "0xbd2e...f304", from: "0x3C4d...5e6f", to: "0x7F3a...4a6", value: 500, token: "CSEC", timestamp: Date.now() - 86_400_000, status: "confirmed" as const, risk: null },
  { id: "act-5", type: "swap" as const, hash: "0xce3f...0415", from: "0x7F3a...4a6", to: "0xDeF1...C0dE", value: 1000, token: "USDC", timestamp: Date.now() - 172_800_000, status: "confirmed" as const, risk: null },
  { id: "act-6", type: "send" as const, hash: "0xdf40...1526", from: "0x7F3a...4a6", to: "0x4D5e...6f70", value: 10, token: "CSEC", timestamp: Date.now() - 259_200_000, status: "failed" as const, risk: null },
];

export const walletRisks = [
  { id: "wr-1", name: "Seed Phrase Exposure", severity: "critical", description: "Seed phrase stored in plaintext in local storage", active: true },
  { id: "wr-2", name: "Blind Signing", severity: "high", description: "User signed a transaction without verifying the full details", active: true },
  { id: "wr-3", name: "Weak Entropy", severity: "high", description: "Wallet generated with weak random seed", active: true },
  { id: "wr-4", name: "Malicious dApp Approval", severity: "critical", description: "Unlimited approval granted to suspicious contract", active: true },
  { id: "wr-5", name: "Clipboard Hijacking", severity: "medium", description: "Address copied may have been replaced by malicious script", active: false },
];
