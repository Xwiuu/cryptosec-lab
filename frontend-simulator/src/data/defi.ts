export const defiOverview = {
  totalTVL: 45_800_000,
  totalCollateral: 62_300_000,
  totalBorrowed: 38_900_000,
  badDebt: 420_000,
  activePools: 12,
  riskScore: 68,
  averageHealthFactor: 1.85,
  liquidationQueue: 14,
};

export const defiPools = [
  { id: "pool-1", name: "CSEC-ETH LP", protocol: "CryptoSec DEX", tvl: 12_500_000, collateral: 0, borrowed: 0, badDebt: 0, healthFactor: 0, oraclePrice: 4.72, oracleStatus: "healthy" as const, liquidationThreshold: 0, ltv: 0, riskScore: 15, apy: 8.5, totalLiquidity: 12_500_000, utilizationRate: 0 },
  { id: "pool-2", name: "ETH Lending Pool", protocol: "CryptoSec Lending", tvl: 18_200_000, collateral: 28_500_000, borrowed: 15_800_000, badDebt: 180_000, healthFactor: 1.92, oraclePrice: 2850, oracleStatus: "healthy" as const, liquidationThreshold: 80, ltv: 75, riskScore: 42, apy: 4.2, totalLiquidity: 18_200_000, utilizationRate: 86.8 },
  { id: "pool-3", name: "USDC Lending Pool", protocol: "CryptoSec Lending", tvl: 10_800_000, collateral: 15_200_000, borrowed: 9_500_000, badDebt: 95_000, healthFactor: 2.15, oraclePrice: 1.0, oracleStatus: "healthy" as const, liquidationThreshold: 85, ltv: 80, riskScore: 28, apy: 3.8, totalLiquidity: 10_800_000, utilizationRate: 87.9 },
  { id: "pool-4", name: "WBTC Lending Pool", protocol: "CryptoSec Lending", tvl: 8_500_000, collateral: 12_800_000, borrowed: 7_200_000, badDebt: 95_000, healthFactor: 1.68, oraclePrice: 42_500, oracleStatus: "stale" as const, liquidationThreshold: 75, ltv: 70, riskScore: 65, apy: 5.1, totalLiquidity: 8_500_000, utilizationRate: 84.7 },
  { id: "pool-5", name: "CSEC Staking Pool", protocol: "CryptoSec Staking", tvl: 3_200_000, collateral: 0, borrowed: 0, badDebt: 0, healthFactor: 0, oraclePrice: 4.72, oracleStatus: "healthy" as const, liquidationThreshold: 0, ltv: 0, riskScore: 10, apy: 12.0, totalLiquidity: 3_200_000, utilizationRate: 0 },
  { id: "pool-6", name: "Oracle USDC/ETH", protocol: "CryptoSec Oracle", tvl: 0, collateral: 5_800_000, borrowed: 4_900_000, badDebt: 50_000, healthFactor: 1.22, oraclePrice: 2850, oracleStatus: "manipulated" as const, liquidationThreshold: 80, ltv: 75, riskScore: 88, apy: 0, totalLiquidity: 0, utilizationRate: 0 },
];

export const defiRisks = [
  { id: "dr-1", name: "Oracle Manipulation", severity: "critical", description: "WBTC oracle price is stale. USDC/ETH oracle showing manipulated price.", affectedPools: ["pool-4", "pool-6"] },
  { id: "dr-2", name: "High Utilization", severity: "high", description: "ETH and USDC pools above 85% utilization. Potential liquidity crunch.", affectedPools: ["pool-2", "pool-3"] },
  { id: "dr-3", name: "Low Health Factor", severity: "high", description: "Several positions near liquidation threshold (HF < 1.3).", affectedPools: ["pool-6"] },
  { id: "dr-4", name: "Bad Debt Accumulation", severity: "medium", description: "Total bad debt of $420K across lending pools.", affectedPools: ["pool-2", "pool-3", "pool-4", "pool-6"] },
];
