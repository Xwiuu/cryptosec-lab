export type BridgeDirection = "lock_mint" | "burn_release";
export type BridgeTxStatus = "pending" | "confirmed" | "failed" | "replayed";

export interface BridgeTransaction {
  id: string;
  sourceChain: string;
  targetChain: string;
  token: string;
  amount: number;
  user: string;
  direction: BridgeDirection;
  status: BridgeTxStatus;
  nonce: number;
  chainId: number;
  timestamp: number;
  isReplay: boolean;
  validators: number;
  confirmations: number;
}

export interface BridgeValidator {
  id: string;
  name: string;
  stake: number;
  isActive: boolean;
  isCompromised: boolean;
  signedMessages: number;
}
