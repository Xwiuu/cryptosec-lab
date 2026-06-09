use crate::finding::{Confidence, Finding};
use crate::rules::Rule;
use crate::severity::Severity;
use regex::Regex;

pub struct SelfDestructRule;

impl Rule for SelfDestructRule {
    fn name(&self) -> &'static str {
        "Selfdestruct Usage"
    }
    fn category(&self) -> &'static str {
        "Architecture/Design"
    }
    fn check(&self, lines: &[(usize, String)], file: &str) -> Vec<Finding> {
        let mut findings = Vec::new();
        let re = Regex::new(r"(selfdestruct|self_destruct|suicide)\s*\(").unwrap();

        for (ln, text) in lines {
            if re.is_match(text) && !text.trim_start().starts_with("//") {
                let snippet = crate::parser::extract_snippet(lines, *ln, 3);
                findings.push(Finding::new(
                    format!("SD-{:04}", ln),
                    "Selfdestruct Usage".to_string(),
                    Severity::High,
                    file.to_string(),
                    *ln,
                    snippet,
                    "selfdestruct can be used to destroy a contract and force ETH to an arbitrary address. This is being deprecated (EIP-4758).".to_string(),
                    "Avoid selfdestruct. Consider alternative mechanisms for contract lifecycle management.".to_string(),
                    Confidence::High,
                    self.category().to_string(),
                ));
            }
        }
        findings
    }
}
