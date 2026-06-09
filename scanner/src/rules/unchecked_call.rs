use crate::finding::{Confidence, Finding};
use crate::rules::Rule;
use crate::severity::Severity;
use regex::Regex;

pub struct UncheckedCallRule;

impl Rule for UncheckedCallRule {
    fn name(&self) -> &'static str {
        "Unchecked External Call"
    }
    fn category(&self) -> &'static str {
        "Input Validation & Error Handling"
    }
    fn check(&self, lines: &[(usize, String)], file: &str) -> Vec<Finding> {
        let mut findings = Vec::new();
        let call_re = Regex::new(r"\.call\s*(\{.*\})?\s*\(").unwrap();

        for (i, (ln, text)) in lines.iter().enumerate() {
            if !call_re.is_match(text) || text.trim_start().starts_with("//") {
                continue;
            }

            let mut checked = false;
            let lookahead = std::cmp::min(i + 5, lines.len());
            for (_, next_line) in lines.iter().take(lookahead).skip(i + 1) {
                if next_line.contains("require(")
                    || next_line.contains("if (!")
                    || next_line.contains("if(!")
                {
                    checked = true;
                    break;
                }
            }

            let lookback_start = i.saturating_sub(5);
            for (_, prev_line) in lines.iter().take(i).skip(lookback_start) {
                if prev_line.contains("(bool ok")
                    || prev_line.contains("(bool success")
                    || prev_line.contains("(bool result")
                    || prev_line.contains("(bool o")
                {
                    checked = true;
                    break;
                }
            }

            if !checked {
                let snippet = crate::parser::extract_snippet(lines, *ln, 3);
                findings.push(Finding::new(
                    format!("UC-{:04}", ln),
                    "Unchecked External Call".to_string(),
                    Severity::Medium,
                    file.to_string(),
                    *ln,
                    snippet,
                    "External call return value is not checked. If the call fails, the transaction will not revert.".to_string(),
                    "Always check the return value of external calls using require(success) or if(!success) { revert; }.".to_string(),
                    Confidence::High,
                    self.category().to_string(),
                ));
            }
        }
        findings
    }
}
