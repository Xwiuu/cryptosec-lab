use crate::finding::{Confidence, Finding};
use crate::rules::Rule;
use crate::severity::Severity;
use regex::Regex;

pub struct ReentrancyRule;

impl Rule for ReentrancyRule {
    fn name(&self) -> &'static str {
        "Reentrancy"
    }
    fn category(&self) -> &'static str {
        "Reentrancy"
    }
    fn check(&self, lines: &[(usize, String)], file: &str) -> Vec<Finding> {
        let mut findings = Vec::new();
        let call_re = Regex::new(r"\.call\s*\{.*value.*\}").unwrap();
        let state_re = Regex::new(r"(balances\[|balanceOf\[|_balances\[)").unwrap();
        let sub_re = Regex::new(r"(balances\[.*\]\s*-=|balanceOf\[.*\]\s*-=)").unwrap();

        let mut call_lines: Vec<(usize, String)> = Vec::new();

        for (ln, text) in lines {
            if call_re.is_match(text) {
                call_lines.push((*ln, text.clone()));
            }
        }

        for (call_ln, _call_text) in &call_lines {
            let mut found_state_update = false;
            for (ln, text) in lines {
                if *ln > *call_ln && (state_re.is_match(text) || sub_re.is_match(text)) {
                    found_state_update = true;
                }
            }

            if found_state_update {
                let snippet = crate::parser::extract_snippet(lines, *call_ln, 3);
                findings.push(Finding::new(
                    format!("RE-{:04}", call_ln),
                    "Reentrancy Vulnerability".to_string(),
                    Severity::High,
                    file.to_string(),
                    *call_ln,
                    snippet,
                    "External call followed by state update. This is vulnerable to reentrancy attacks.".to_string(),
                    "Apply Checks-Effects-Interactions pattern: update state before making external calls, or use a reentrancy guard.".to_string(),
                    Confidence::High,
                    self.category().to_string(),
                ));
            }
        }
        findings
    }
}
