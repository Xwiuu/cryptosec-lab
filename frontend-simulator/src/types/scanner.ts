export type FindingStatus = "open" | "fixed" | "accepted_risk" | "retest_passed";
export type ScannerConfidence = "high" | "medium" | "low";

export interface ScannerFinding {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  category: string;
  file: string;
  line: number;
  snippet: string;
  recommendation: string;
  confidence: ScannerConfidence;
  status: FindingStatus;
  rule: string;
}

export interface ScannerRule {
  id: string;
  name: string;
  description: string;
  severity: Severity;
  category: string;
  isActive: boolean;
}

export type Severity = "critical" | "high" | "medium" | "low" | "info";
