export type WalletRisk = "none" | "seed_exposed" | "blind_signing" | "weak_entropy" | "plaintext_private_key" | "malicious_dapp_approval" | "clipboard_hijacking";

export interface Wallet {
  address: string;
  publicKey: string;
  privateKey: string;
  algorithm: string;
  created: number;
  balance: number;
  tokens: WalletToken[];
  riskFlags: WalletRisk[];
  isDemo: boolean;
}

export interface WalletToken {
  symbol: string;
  name: string;
  balance: number;
  decimals: number;
}

export interface SeedPhrase {
  words: string[];
  isDemo: boolean;
  entropy: string;
  length: number;
}

export interface SignedMessage {
  message: string;
  signature: string;
  signer: string;
  timestamp: number;
  isValid: boolean;
}

export interface WalletActivity {
  id: string;
  type: "send" | "receive" | "approve" | "sign" | "swap" | "interact";
  hash: string;
  from: string;
  to: string;
  value: number;
  token: string;
  timestamp: number;
  status: "confirmed" | "pending" | "failed";
  risk: WalletRisk | null;
}
