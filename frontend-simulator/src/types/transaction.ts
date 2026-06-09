export type TxStatus = "pending" | "confirmed" | "failed" | "rejected";

export interface Transaction {
  hash: string;
  nonce: number;
  from: string;
  to: string;
  value: number;
  gasLimit: number;
  gasPrice: number;
  fee: number;
  data: string;
  signature: string;
  status: TxStatus;
  timestamp: number;
  blockNumber: number | null;
  isValid: boolean;
  isReplay: boolean;
  isDoubleSpend: boolean;
}

export interface MempoolEntry {
  tx: Transaction;
  addedAt: number;
  priority: number;
  isSpam: boolean;
  risk: string | null;
}
