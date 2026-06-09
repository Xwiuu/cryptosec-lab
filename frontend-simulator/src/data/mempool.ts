export const pendingTransactions = [
  { hash: "0x8a9b...c0d1", nonce: 42, from: "0x7F3a...4a6", to: "0x1A2b...3c4", value: 2.5, fee: 0.003, gasPrice: 25, gasLimit: 21000, status: "pending" as const, isValid: true, isReplay: false, isDoubleSpend: false, timestamp: Date.now() - 1000, blockNumber: null },
  { hash: "0x9b0c...d1e2", nonce: 43, from: "0x7F3a...4a6", to: "0xDeF1...C0dE", value: 1000, fee: 0.008, gasPrice: 50, gasLimit: 65000, status: "pending" as const, isValid: true, isReplay: false, isDoubleSpend: false, timestamp: Date.now() - 2000, blockNumber: null },
  { hash: "0xac1d...e2f3", nonce: 7, from: "0x1A2b...3c4", to: "0x3C4d...5e6f", value: 500, fee: 0.001, gasPrice: 15, gasLimit: 21000, status: "pending" as const, isValid: false, isReplay: true, isDoubleSpend: false, timestamp: Date.now() - 3000, blockNumber: null },
  { hash: "0xbd2e...f304", nonce: 10, from: "0xB4d5...6e7f", to: "0x5E6f...7A8b", value: 0.1, fee: 0.015, gasPrice: 120, gasLimit: 21000, status: "pending" as const, isValid: true, isReplay: false, isDoubleSpend: false, timestamp: Date.now() - 500, blockNumber: null },
  { hash: "0xce3f...0415", nonce: 15, from: "0xC5e6...7F8a", to: "0x6F7a...8b9c", value: 0.05, fee: 0.002, gasPrice: 20, gasLimit: 21000, status: "pending" as const, isValid: true, isReplay: false, isDoubleSpend: true, timestamp: Date.now() - 800, blockNumber: null },
  { hash: "0xdf40...1526", nonce: 3, from: "0xD6f7...8A9b", to: "0x7A8b...9c0d", value: 10000, fee: 0.001, gasPrice: 8, gasLimit: 21000, status: "pending" as const, isValid: false, isReplay: false, isDoubleSpend: false, timestamp: Date.now() - 10000, blockNumber: null },
  { hash: "0xe051...2637", nonce: 1, from: "0xE7a8...9b0c", to: "0x8B9c...0d1e", value: 0.01, fee: 0.1, gasPrice: 500, gasLimit: 21000, status: "pending" as const, isValid: true, isReplay: false, isDoubleSpend: false, timestamp: Date.now() - 100, blockNumber: null },
  { hash: "0xf162...3748", nonce: 5, from: "0xF8a9...0b1c", to: "0x9C0d...1e2f", value: 0.5, fee: 0.005, gasPrice: 35, gasLimit: 40000, status: "pending" as const, isValid: true, isReplay: false, isDoubleSpend: false, timestamp: Date.now() - 4000, blockNumber: null },
];

export const mempoolSummary = {
  totalPending: 23,
  uniqueSenders: 18,
  totalFees: 0.089,
  avgGasPrice: 42,
  highestFee: 0.1,
  lowestFee: 0.001,
  spamCount: 5,
  replayCount: 1,
  doubleSpendCount: 1,
  invalidSignatureCount: 1,
};

export const mempoolProtectionRules: Record<string, { vulnerable: number | boolean; secure: number | boolean; compare: number | boolean }> = {
  minFee: { vulnerable: 0, secure: 0.001, compare: 0 },
  maxTxPerAddress: { vulnerable: 100, secure: 5, compare: 100 },
  deduplicationEnabled: { vulnerable: false, secure: true, compare: false },
  nonceValidation: { vulnerable: false, secure: true, compare: false },
  signatureVerification: { vulnerable: false, secure: true, compare: false },
};
