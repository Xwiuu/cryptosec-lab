export interface AuditReport {
  id: string;
  title: string;
  client: string;
  date: string;
  scope: string[];
  severity: Severity;
  findings: AuditFinding[];
  executiveSummary: string;
  status: "draft" | "final" | "published";
  type: "smart_contract" | "defi" | "bridge" | "wallet" | "protocol" | "dex";
}

export interface AuditFinding {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  status: FindingStatus;
  file: string;
  line: number;
  recommendation: string;
}

export type Severity = "critical" | "high" | "medium" | "low" | "info";
export type FindingStatus = "open" | "fixed" | "accepted_risk" | "retest_passed";
