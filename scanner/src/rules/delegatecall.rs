use crate::finding::{Confidence, Finding};
use crate::rules::Rule;
use crate::severity::Severity;
use regex::Regex;

pub struct DelegateCallRule;

impl Rule for DelegateCallRule {
    fn name(&self) -> &'static str {
        "Delegatecall Usage"
    }
    fn category(&self) -> &'static str {
        "Architecture/Design"
    }
    fn check(&self, lines: &[(usize, String)], file: &str) -> Vec<Finding> {
        let mut findings = Vec::new();
        let re = Regex::new(r"delegatecall").unwrap();

        for (ln, text) in lines {
            if re.is_match(text) && !text.trim_start().starts_with("//") {
                let snippet = crate::parser::extract_snippet(lines, *ln, 3);
                findings.push(Finding::new(
                    format!("DC-{:04}", ln),
                    "Delegatecall Usage".to_string(),
                    Severity::High,
                    file.to_string(),
                    *ln,
                    snippet,
                    "delegatecall executes code in the context of the caller. It can lead to unexpected state changes if the target contract is malicious or compromised.".to_string(),
                    "Minimize delegatecall usage. Ensure the target address is trusted and properly validated. Consider using a proxy pattern with strict upgrade controls.".to_string(),
                    Confidence::High,
                    self.category().to_string(),
                ));
            }
        }
        findings
    }
}
