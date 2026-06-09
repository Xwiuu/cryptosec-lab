export type ContractCategory = "bank" | "token" | "nft" | "dao" | "oracle" | "upgradeable" | "randomness" | "defi";
export type ContractVariant = "vulnerable" | "secure";

export interface Contract {
  id: string;
  name: string;
  category: ContractCategory;
  variant: ContractVariant;
  language: "solidity";
  version: string;
  source: string;
  highlightLines: number[];
  description: string;
  vulnerability: string | null;
  severity: Severity | null;
  exploitSteps: string[];
  mitigation: string;
  testFile: string;
}

export type Severity = "critical" | "high" | "medium" | "low" | "info";
