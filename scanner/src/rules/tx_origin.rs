use crate::finding::{Confidence, Finding};
use crate::rules::Rule;
use crate::severity::Severity;
use regex::Regex;

pub struct TxOriginRule;

impl Rule for TxOriginRule {
    fn name(&self) -> &'static str {
        "tx.origin Usage"
    }
    fn category(&self) -> &'static str {
        "Access Control"
    }
    fn check(&self, lines: &[(usize, String)], file: &str) -> Vec<Finding> {
        let mut findings = Vec::new();
        let re = Regex::new(r"tx\.origin").unwrap();

        for (ln, text) in lines {
            if re.is_match(text)
                && !text.trim_start().starts_with("//")
                && !text.trim_start().starts_with("/*")
            {
                let snippet = crate::parser::extract_snippet(lines, *ln, 3);
                findings.push(Finding::new(
                    format!("TO-{:04}", ln),
                    "tx.origin Used for Authorization".to_string(),
                    Severity::Medium,
                    file.to_string(),
                    *ln,
                    snippet,
                    "tx.origin should not be used for authorization. It can lead to phishing attacks where a victim contract calls an attacker contract.".to_string(),
                    "Use msg.sender instead of tx.origin for authentication checks.".to_string(),
                    Confidence::High,
                    self.category().to_string(),
                ));
            }
        }
        findings
    }
}
