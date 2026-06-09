export const ammPools = [
  { id: "amm-1", tokenA: "CSEC", tokenB: "ETH", reserveA: 2_500_000, reserveB: 4_200, k: 10_500_000_000, price: 0.00168, fee: 0.003, liquidity: 8_400_000, volume24h: 1_200_000 },
  { id: "amm-2", tokenA: "USDC", tokenB: "ETH", reserveA: 8_500_000, reserveB: 2_980, k: 25_330_000_000, price: 0.00035, fee: 0.003, liquidity: 17_000_000, volume24h: 3_500_000 },
  { id: "amm-3", tokenA: "CSEC", tokenB: "USDC", reserveA: 1_800_000, reserveB: 8_500_000, k: 15_300_000_000_000, price: 4.72, fee: 0.003, liquidity: 12_000_000, volume24h: 850_000 },
  { id: "amm-4", tokenA: "WBTC", tokenB: "ETH", reserveA: 120, reserveB: 2_040, k: 244_800, price: 17.0, fee: 0.005, liquidity: 5_100_000, volume24h: 420_000 },
];

export const dexOverview = {
  totalLiquidity: 42_500_000,
  totalVolume24h: 5_970_000,
  activePools: 4,
  averageFee: 0.0035,
  totalSwaps24h: 12_847,
  uniqueTraders24h: 3_201,
};

export const dexRisks = [
  { id: "dxr-1", name: "Sandwich Attack Vector", severity: "high", description: "No minimum amountOut protection on swaps. Front-runnable.", poolId: "amm-1" },
  { id: "dxr-2", name: "No Slippage Protection", severity: "high", description: "Swaps execute with 0 slippage tolerance. MEV susceptible.", poolId: "amm-2" },
  { id: "dxr-3", name: "No TWAP Oracle", severity: "medium", description: "Pool uses spot price for oracle, manipulable via flash loans.", poolId: "amm-3" },
  { id: "dxr-4", name: "Low Liquidity Pool", severity: "medium", description: "WBTC-ETH pool has thin liquidity. High price impact risk.", poolId: "amm-4" },
];
