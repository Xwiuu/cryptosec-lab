export type ProjectStatus =
  | "Discovery"
  | "In Review"
  | "Findings Ready"
  | "Fixing"
  | "Retest"
  | "Completed";

export interface Project {
  id: string;
  name: string;
  client: string;
  status: ProjectStatus;
  riskScore: number;
  findingsCount: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  startDate: string;
  endDate?: string;
  repoUrl: string;
  description: string;
}

export type ScanStatus = "Passed" | "Failed" | "Warnings";

export interface Scan {
  id: string;
  project: string;
  timestamp: string;
  scannerType: string;
  rulesTriggered: number;
  filesScanned: number;
  durationSeconds: number;
  status: ScanStatus;
  findings: number;
}

export type FindingStatus =
  | "Open"
  | "In Fix"
  | "Ready for Retest"
  | "Retest Passed"
  | "Accepted Risk";

export type FindingSeverity = "critical" | "high" | "medium" | "low" | "info";

export interface Finding {
  id: string;
  title: string;
  description: string;
  severity: FindingSeverity;
  status: FindingStatus;
  category: string;
  impact: string;
  mitigation: string;
  detectedIn: string;
}

export type ReportStatus =
  | "Draft"
  | "Internal Review"
  | "Sent to Client"
  | "Retest Updated"
  | "Final";

export interface Report {
  id: string;
  projectName: string;
  version: string;
  status: ReportStatus;
  lastUpdated: string;
  downloadUrl?: string;
}

export interface Client {
  id: string;
  name: string;
  industry: string;
  status: "Active" | "Inactive";
  riskScore: number;
  auditsCompleted: number;
}

export interface LabRun {
  id: string;
  scenarioName: string;
  timestamp: string;
  attackType: "Reentrancy" | "Oracle" | "Sandwich" | "Bridge" | "DAO";
  gasUsed: number;
  stolenAmount: string;
  txHash: string;
  success: boolean;
}
