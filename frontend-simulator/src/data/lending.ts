export const lendingPositions = [
  { user: "0x7F3a...4a6", collateral: 150_000, collateralToken: "ETH", borrowed: 85_000, borrowedToken: "USDC", healthFactor: 1.85, ltv: 56.7, isLiquidatable: false },
  { user: "0x1A2b...3c4", collateral: 75_000, collateralToken: "WBTC", borrowed: 55_000, borrowedToken: "USDC", healthFactor: 1.22, ltv: 73.3, isLiquidatable: true },
  { user: "0x3C4d...5e6f", collateral: 200_000, collateralToken: "ETH", borrowed: 120_000, borrowedToken: "CSEC", healthFactor: 1.45, ltv: 60.0, isLiquidatable: false },
  { user: "0xA77a...C001", collateral: 500_000, collateralToken: "ETH", borrowed: 480_000, borrowedToken: "USDC", healthFactor: 1.05, ltv: 96.0, isLiquidatable: true },
  { user: "0x5E6f...7A8b", collateral: 50_000, collateralToken: "CSEC", borrowed: 25_000, borrowedToken: "USDC", healthFactor: 2.10, ltv: 50.0, isLiquidatable: false },
];

export const lendingPoolInfo = {
  totalCollateral: 62_300_000,
  totalBorrowed: 38_900_000,
  availableLiquidity: 23_400_000,
  utilizationRate: 62.4,
  averageApy: 4.5,
  liquidationBonus: 5.0,
  baseRate: 2.0,
};

export const oracleManipulationScenario = {
  normalPrice: 2850,
  manipulatedPrice: 3200,
  priceDeviation: 12.3,
  exploitableProfit: 450_000,
  affectedPositions: 3,
};
