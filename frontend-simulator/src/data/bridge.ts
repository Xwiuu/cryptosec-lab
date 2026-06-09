export const bridgeTransactions = [
  { id: "btx-1", sourceChain: "CryptoSec Localnet", targetChain: "Ethereum Sim", token: "CSEC", amount: 50_000, user: "0x7F3a...4a6", direction: "lock_mint" as const, status: "confirmed" as const, nonce: 1, chainId: 31337, timestamp: Date.now() - 3600_000, isReplay: false, validators: 5, confirmations: 12 },
  { id: "btx-2", sourceChain: "Ethereum Sim", targetChain: "CryptoSec Localnet", token: "ETH", amount: 100, user: "0x1A2b...3c4", direction: "lock_mint" as const, status: "confirmed" as const, nonce: 2, chainId: 1337, timestamp: Date.now() - 7200_000, isReplay: false, validators: 5, confirmations: 10 },
  { id: "btx-3", sourceChain: "CryptoSec Localnet", targetChain: "Ethereum Sim", token: "CSEC", amount: 10_000, user: "0x3C4d...5e6f", direction: "burn_release" as const, status: "pending" as const, nonce: 3, chainId: 31337, timestamp: Date.now() - 300_000, isReplay: false, validators: 3, confirmations: 2 },
  { id: "btx-4", sourceChain: "Ethereum Sim", targetChain: "CryptoSec Localnet", token: "CSEC", amount: 50_000, user: "0xA77a...C001", direction: "lock_mint" as const, status: "confirmed" as const, nonce: 1, chainId: 1337, timestamp: Date.now() - 7200_000, isReplay: true, validators: 3, confirmations: 8 },
  { id: "btx-5", sourceChain: "CryptoSec Localnet", targetChain: "Ethereum Sim", token: "USDC", amount: 250_000, user: "0x5E6f...7A8b", direction: "lock_mint" as const, status: "confirmed" as const, nonce: 4, chainId: 31337, timestamp: Date.now() - 14400_000, isReplay: false, validators: 5, confirmations: 15 },
];

export const bridgeValidators = [
  { id: "bv-1", name: "Bridge Validator 01", stake: 200_000, isActive: true, isCompromised: false, signedMessages: 1_450 },
  { id: "bv-2", name: "Bridge Validator 02", stake: 180_000, isActive: true, isCompromised: false, signedMessages: 1_423 },
  { id: "bv-3", name: "Bridge Validator 03", stake: 150_000, isActive: true, isCompromised: true, signedMessages: 1_401 },
  { id: "bv-4", name: "Bridge Validator 04", stake: 120_000, isActive: true, isCompromised: false, signedMessages: 1_389 },
  { id: "bv-5", name: "Bridge Validator 05", stake: 100_000, isActive: true, isCompromised: false, signedMessages: 1_367 },
];

export const bridgeRisks = [
  { id: "br-1", name: "Message Replay Attack", severity: "critical", description: "Transaction btx-4 is a replay of btx-1. Same nonce used on different chain.", active: true },
  { id: "br-2", name: "Validator Compromise", severity: "critical", description: "Bridge Validator 03 shows signs of compromise. Abnormal signing pattern.", active: true },
  { id: "br-3", name: "No Domain Separator", severity: "high", description: "Bridge messages lack chain_id domain separator. Cross-chain replay possible.", active: true },
  { id: "br-4", name: "Low Validator Threshold", severity: "medium", description: "Only 3/5 validators required for message confirmation. 2 compromised = exploit.", active: true },
];
