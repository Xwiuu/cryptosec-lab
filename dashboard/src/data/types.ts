export type Severity = "Critical" | "High" | "Medium" | "Low" | "Informational";

export interface Finding {
  id: string;
  title: string;
  severity: Severity;
  file: string;
  line: number;
  snippet: string;
  description: string;
  recommendation: string;
  confidence: string;
  category: string;
}
