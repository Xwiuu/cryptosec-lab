use chrono::Local;
use std::collections::HashMap;
use std::fs;
use std::path::Path;

use crate::finding::Finding;
use crate::severity::Severity;

pub struct ReportGenerator;

impl ReportGenerator {
    pub fn generate_markdown(findings: &[Finding], output_path: &Path) -> anyhow::Result<()> {
        let now = Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
        let severity_counts = Self::count_by_severity(findings);
        let total = findings.len();

        let mut markdown = String::new();

        markdown.push_str("# CryptoSec Lab - Security Audit Report\n\n");
        markdown.push_str(&format!("**Generated:** {}  \n", now));
        markdown.push_str(&format!("**Total Findings:** {}  \n\n", total));

        markdown.push_str("## Executive Summary\n\n");
        markdown.push_str(&format!(
            "The scan identified **{}** potential security issues with the following severity breakdown:\n\n",
            total
        ));

        markdown.push_str("| Severity | Count |\n");
        markdown.push_str("|----------|------:|\n");

        let severity_order = [
            Severity::Critical,
            Severity::High,
            Severity::Medium,
            Severity::Low,
            Severity::Informational,
        ];

        for sev in &severity_order {
            let count = severity_counts.get(sev).copied().unwrap_or(0);
            let emoji = match sev {
                Severity::Critical => "🛑",
                Severity::High => "🔴",
                Severity::Medium => "🟡",
                Severity::Low => "🟢",
                Severity::Informational => "ℹ️",
            };
            markdown.push_str(&format!("| {} {} | {} |\n", emoji, sev, count));
        }

        markdown.push_str(&format!("\n| **Total** | **{}** |\n\n", total));

        markdown.push_str("## Scope\n\n");
        let mut files: Vec<&str> = findings.iter().map(|f| f.file.as_str()).collect();
        files.sort();
        files.dedup();
        for file in &files {
            markdown.push_str(&format!("- `{}`\n", file));
        }
        markdown.push('\n');

        markdown.push_str("## Findings Overview\n\n");
        markdown.push_str("| ID | Severity | Title | File | Line |\n");
        markdown.push_str("|----|----------|-------|------|-----:|\n");

        for finding in findings {
            let sev_str = match finding.severity {
                Severity::Critical => "🛑 Critical",
                Severity::High => "🔴 High",
                Severity::Medium => "🟡 Medium",
                Severity::Low => "🟢 Low",
                Severity::Informational => "ℹ️ Info",
            };
            let short_file = finding
                .file
                .split('\\')
                .next_back()
                .unwrap_or(&finding.file)
                .split('/')
                .next_back()
                .unwrap_or(&finding.file);
            markdown.push_str(&format!(
                "| {} | {} | {} | {} | {} |\n",
                finding.id, sev_str, finding.title, short_file, finding.line
            ));
        }

        markdown.push_str("\n## Detailed Findings\n\n");
        for sev in &severity_order {
            let sev_findings: Vec<&Finding> =
                findings.iter().filter(|f| f.severity == *sev).collect();
            if sev_findings.is_empty() {
                continue;
            }

            markdown.push_str(&format!("### {} Severity Findings\n\n", sev));
            for f in &sev_findings {
                let short_file = f
                    .file
                    .split('\\')
                    .next_back()
                    .unwrap_or(&f.file)
                    .split('/')
                    .next_back()
                    .unwrap_or(&f.file);
                markdown.push_str(&format!("#### {} - {}\n\n", f.id, f.title));
                markdown.push_str(&format!("- **Severity:** {}\n", f.severity));
                markdown.push_str(&format!("- **Confidence:** {}\n", f.confidence));
                markdown.push_str(&format!("- **Category:** {}\n", f.category));
                markdown.push_str(&format!("- **File:** `{}`\n", short_file));
                markdown.push_str(&format!("- **Line:** {}\n\n", f.line));
                markdown.push_str("**Description:**\n\n");
                markdown.push_str(&format!("{}\n\n", f.description));
                markdown.push_str("**Code Snippet:**\n\n```solidity\n");
                markdown.push_str(&f.snippet);
                markdown.push_str("```\n\n");
                markdown.push_str("**Recommendation:**\n\n");
                markdown.push_str(&format!("{}\n\n", f.recommendation));
                markdown.push_str("---\n\n");
            }
        }

        markdown.push_str("## Recommendations\n\n");
        Self::generate_recommendations(&mut markdown, findings);

        markdown.push_str("## Appendix\n\n");
        markdown.push_str("### Severity Classification\n\n");
        markdown.push_str("| Severity | Description |\n");
        markdown.push_str("|----------|-------------|\n");
        markdown.push_str("| 🛑 Critical | Direct loss of funds or permanent freeze of assets |\n");
        markdown.push_str("| 🔴 High | Significant security risk, potential loss of funds |\n");
        markdown.push_str(
            "| 🟡 Medium | Moderate risk, potential for exploitation under specific conditions |\n",
        );
        markdown.push_str("| 🟢 Low | Minor concern, best practice violation |\n");
        markdown.push_str("| ℹ️ Info | Informational observation, no immediate risk |\n\n");

        markdown.push_str("### Scanner Configuration\n\n");
        markdown.push_str("- **Tool:** CryptoSec Scanner v0.1.0\n");
        markdown.push_str("- **Analysis Type:** Static analysis (regex/heuristics)\n");
        markdown.push_str("- **Rules Applied:** Access Control, Reentrancy, tx.origin, Unchecked Calls, Delegatecall, Randomness, Timestamp, Selfdestruct, Approval Risk, Upgradeability, Oracle Risk\n\n");

        markdown.push_str("---\n\n");
        markdown.push_str(
            "*Report generated by CryptoSec Lab - Local Educational Solidity Security Scanner*\n",
        );

        fs::write(output_path, markdown)?;
        Ok(())
    }

    pub fn generate_json(findings: &[Finding], output_path: &Path) -> anyhow::Result<()> {
        let json = serde_json::to_string_pretty(findings)?;
        fs::write(output_path, json)?;
        Ok(())
    }

    fn count_by_severity(findings: &[Finding]) -> HashMap<Severity, usize> {
        let mut counts = HashMap::new();
        for f in findings {
            *counts.entry(f.severity.clone()).or_insert(0) += 1;
        }
        counts
    }

    fn generate_recommendations(md: &mut String, findings: &[Finding]) {
        let categories: Vec<&str> = findings
            .iter()
            .map(|f| f.category.as_str())
            .collect::<std::collections::HashSet<_>>()
            .into_iter()
            .collect();

        for cat in categories {
            let cat_findings: Vec<&Finding> =
                findings.iter().filter(|f| f.category == cat).collect();
            if cat_findings.is_empty() {
                continue;
            }

            md.push_str(&format!("**{}**\n\n", cat));
            let recs: Vec<&str> = cat_findings
                .iter()
                .map(|f| f.recommendation.as_str())
                .collect();
            let mut seen = std::collections::HashSet::new();
            for rec in &recs {
                if seen.insert(rec) {
                    md.push_str(&format!("- {}\n", rec));
                }
            }
            md.push('\n');
        }
    }
}
