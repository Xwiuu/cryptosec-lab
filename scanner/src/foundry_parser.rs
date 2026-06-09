use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct FoundryTestSummary {
    pub total_tests: u32,
    pub passed: u32,
    pub failed: u32,
    pub skipped: u32,
    pub failed_tests: Vec<String>,
    pub gas_report: Vec<GasEntry>,
    pub raw_output: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GasEntry {
    pub test_name: String,
    pub gas_used: String,
}

impl FoundryTestSummary {
    pub fn new() -> Self {
        Self::default()
    }
}

pub fn parse_foundry_output(path: &Path) -> anyhow::Result<FoundryTestSummary> {
    let content = fs::read_to_string(path)?;
    let mut summary = FoundryTestSummary::new();
    summary.raw_output = content.clone();

    let running_re = regex::Regex::new(r"Running\s+(\d+)\s+test")?;
    let gas_re = regex::Regex::new(r"(\w[\w_]+)\(.*\).*gas:\s*([\d,]+)")?;

    for line in content.lines() {
        let trimmed = line.trim();

        if trimmed.starts_with("[PASS]") || trimmed.contains("... ok") || trimmed.contains("PASS") {
            summary.passed += 1;
            summary.total_tests += 1;
        }

        if trimmed.starts_with("[FAIL]")
            || trimmed.starts_with("[FAIL.")
            || trimmed.contains("... FAILED")
        {
            summary.failed += 1;
            summary.total_tests += 1;
            let name = extract_test_name(trimmed);
            if let Some(n) = name {
                summary.failed_tests.push(n);
            }
        }

        if trimmed.starts_with("[SKIP") || trimmed.contains("... skip") {
            summary.skipped += 1;
        }

        if trimmed.contains("Running") && trimmed.contains("test") {
            if let Some(caps) = running_re.captures(trimmed) {
                if let Some(n) = caps.get(1) {
                    if let Ok(num) = n.as_str().parse::<u32>() {
                        if summary.total_tests == 0 {
                            summary.total_tests = num;
                        }
                    }
                }
            }
        }

        if trimmed.contains("[GAS]") || trimmed.contains("gas") && trimmed.contains("(") {
            if let Some(caps) = gas_re.captures(trimmed) {
                let name = caps
                    .get(1)
                    .map(|m| m.as_str().to_string())
                    .unwrap_or_default();
                let gas = caps
                    .get(2)
                    .map(|m| m.as_str().to_string())
                    .unwrap_or_default();
                if !name.is_empty() {
                    summary.gas_report.push(GasEntry {
                        test_name: name,
                        gas_used: gas,
                    });
                }
            }
        }
    }

    if summary.total_tests == 0 {
        let re = regex::Regex::new(
            r"Test result:\s*(?:OK|FAILED)\.\s*(\d+)\s+passed;\s*(\d+)\s+failed",
        )?;
        if let Some(caps) = re.captures(&content) {
            if let (Some(p), Some(f)) = (caps.get(1), caps.get(2)) {
                summary.passed += p.as_str().parse::<u32>().unwrap_or(0);
                summary.failed += f.as_str().parse::<u32>().unwrap_or(0);
                summary.total_tests = summary.passed + summary.failed;
            }
        }
    }

    Ok(summary)
}

fn extract_test_name(line: &str) -> Option<String> {
    let re = regex::Regex::new(r"\[FAIL.*?\]\s*(\w[\w_]*)").ok()?;
    if let Some(caps) = re.captures(line) {
        return caps.get(1).map(|m| m.as_str().to_string());
    }
    let re2 = regex::Regex::new(r"(test\w[\w_]*)\s*\.\.\. FAILED").ok()?;
    if let Some(caps) = re2.captures(line) {
        return caps.get(1).map(|m| m.as_str().to_string());
    }
    Some(line.to_string())
}
