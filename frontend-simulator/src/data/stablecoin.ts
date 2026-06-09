export const stablecoinState = {
  name: "CryptoSec USD",
  symbol: "CSUSD",
  totalSupply: 25_000_000,
  collateralValue: 32_500_000,
  collateralRatio: 130,
  targetPrice: 1.0,
  currentPrice: 0.98,
  isPegged: false,
  deviation: -2.0,
};

export const stablecoinRisks = [
  { id: "sr-1", name: "Depeg Event", severity: "critical", active: true, description: "CSUSD trading at $0.98 (2% depeg). Collateral ratio dropping." },
  { id: "sr-2", name: "Collateral Volatility", severity: "high", active: true, description: "ETH collateral dropped 15% in 24h. Ratio approaching min threshold." },
  { id: "sr-3", name: "Oracle Manipulation", severity: "critical", active: true, description: "Oracle price feed stale by 30 minutes. Potential manipulation window." },
  { id: "sr-4", name: "Mint Cap Reached", severity: "medium", active: false, description: "Maximum mint limit not yet reached." },
];

export const circuitBreakerState = {
  isActive: false,
  maxMintPerBlock: 100_000,
  minCollateralRatio: 120,
  cooldownPeriod: 600,
  lastTriggered: null,
};
