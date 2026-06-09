export const tokensData = {
  overview: {
    name: "CryptoSec Token",
    symbol: "CSEC",
    totalSupply: 10_000_000,
    circulatingSupply: 7_450_000,
    holders: 3_421,
    price: 4.72,
    marketCap: 47_200_000,
    volume24h: 1_230_000,
  },
  supplyBreakdown: [
    { name: "Circulating", value: 7_450_000, percentage: 74.5 },
    { name: "Staked", value: 1_500_000, percentage: 15 },
    { name: "Treasury", value: 750_000, percentage: 7.5 },
    { name: "Team", value: 300_000, percentage: 3 },
  ],
  transfers: [
    { from: "0x7F3a...4a6", to: "0x1A2b...3c4", amount: 500, timestamp: Date.now() - 3600_000, hash: "0x8a9b...c0d1" },
    { from: "0x1A2b...3c4", to: "0x3C4d...5e6f", amount: 250, timestamp: Date.now() - 7200_000, hash: "0x9b0c...d1e2" },
    { from: "0xC0de...1000", to: "0x7F3a...4a6", amount: 1000, timestamp: Date.now() - 14400_000, hash: "0xac1d...e2f3" },
  ],
  tokenRisks: [
    { id: "tr-1", name: "Unlimited Mint", severity: "critical", description: "Owner can mint unlimited tokens", active: true },
    { id: "tr-2", name: "Hidden Owner Privileges", severity: "high", description: "Owner can blacklist addresses", active: true },
    { id: "tr-3", name: "Tax Manipulation", severity: "medium", description: "Transfer tax can be changed arbitrarily", active: true },
    { id: "tr-4", name: "Infinite Approval", severity: "high", description: "Contract allows infinite approval by default", active: true },
  ],
};
