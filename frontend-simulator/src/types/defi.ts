export interface DeFiPool {
  id: string;
  name: string;
  protocol: string;
  tvl: number;
  collateral: number;
  borrowed: number;
  badDebt: number;
  healthFactor: number;
  oraclePrice: number;
  oracleStatus: "healthy" | "stale" | "manipulated" | "down";
  liquidationThreshold: number;
  ltv: number;
  riskScore: number;
  apy: number;
  totalLiquidity: number;
  utilizationRate: number;
}

export interface AMMPool {
  id: string;
  tokenA: string;
  tokenB: string;
  reserveA: number;
  reserveB: number;
  k: number;
  price: number;
  fee: number;
  liquidity: number;
  volume24h: number;
}

export interface LendingPosition {
  user: string;
  collateral: number;
  collateralToken: string;
  borrowed: number;
  borrowedToken: string;
  healthFactor: number;
  ltv: number;
  isLiquidatable: boolean;
}
