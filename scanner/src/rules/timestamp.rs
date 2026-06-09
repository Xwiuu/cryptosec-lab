use crate::finding::{Confidence, Finding};
use crate::rules::Rule;
use crate::severity::Severity;
use regex::Regex;

pub struct TimestampRule;

impl Rule for TimestampRule {
    fn name(&self) -> &'static str {
        "Timestamp Dependency"
    }
    fn category(&self) -> &'static str {
        "Timing/Dependency"
    }
    fn check(&self, lines: &[(usize, String)], file: &str) -> Vec<Finding> {
        let mut findings = Vec::new();
        let ts_re = Regex::new(r"block\.timestamp").unwrap();
        let eq_check = Regex::new(r"block\.timestamp\s*==").unwrap();
        let lt_check = Regex::new(r"block\.timestamp\s*[<>]").unwrap();
        let tolerance = Regex::new(r"block\.timestamp\s*[+<>].*\d{2,}").unwrap();

        for (ln, text) in lines {
            if !ts_re.is_match(text) || text.trim_start().starts_with("//") {
                continue;
            }

            if eq_check.is_match(text) {
                let snippet = crate::parser::extract_snippet(lines, *ln, 3);
                findings.push(Finding::new(
                    format!("TS-{:04}", ln),
                    "Timestamp Equality Check".to_string(),
                    Severity::Medium,
                    file.to_string(),
                    *ln,
                    snippet,
                    "Using block.timestamp with equality checks is dangerous. Timestamps can be manipulated by miners within a 15-second window.".to_string(),
                    "Avoid equality checks on block.timestamp. Use > or < with a safe buffer instead.".to_string(),
                    Confidence::High,
                    self.category().to_string(),
                ));
            } else if lt_check.is_match(text) && !tolerance.is_match(text) {
                let snippet = crate::parser::extract_snippet(lines, *ln, 3);
                findings.push(Finding::new(
                    format!("TS-{:04}", ln),
                    "Timestamp Comparison Without Tolerance".to_string(),
                    Severity::Low,
                    file.to_string(),
                    *ln,
                    snippet,
                    "block.timestamp comparison without tolerance. Miners can influence timestamps slightly.".to_string(),
                    "Consider adding a tolerance margin or using block.timestamp only for approximate timing.".to_string(),
                    Confidence::Medium,
                    self.category().to_string(),
                ));
            }
        }
        findings
    }
}
