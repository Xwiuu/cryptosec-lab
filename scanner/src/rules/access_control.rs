use crate::finding::{Confidence, Finding};
use crate::rules::Rule;
use crate::severity::Severity;
use regex::Regex;

pub struct AccessControlRule;

impl Rule for AccessControlRule {
    fn name(&self) -> &'static str {
        "Access Control"
    }
    fn category(&self) -> &'static str {
        "Access Control"
    }
    fn check(&self, lines: &[(usize, String)], file: &str) -> Vec<Finding> {
        let mut findings = Vec::new();
        let sensitive_funcs = [
            Regex::new(r"function\s+(mint|upgradeTo|setOwner|setPrice|pause|setAdmin|setFee|setImplementation)\s*\(").unwrap(),
        ];
        let mod_check = Regex::new(r"(onlyOwner|onlyRole|initializer)").unwrap();
        let require_check = Regex::new(r"require\s*\(\s*msg\.sender\s*==").unwrap();

        for (i, (ln, text)) in lines.iter().enumerate() {
            let matched = sensitive_funcs.iter().any(|r| r.is_match(text));
            if !matched {
                continue;
            }

            let mut has_access_control = false;

            let start = i.saturating_sub(5);
            for (_, prev_line) in lines.iter().take(i).skip(start) {
                if mod_check.is_match(prev_line) || require_check.is_match(prev_line) {
                    has_access_control = true;
                    break;
                }
            }

            if !has_access_control {
                let lookahead_end = std::cmp::min(i + 10, lines.len());
                for (_, next_line) in lines.iter().take(lookahead_end).skip(i + 1) {
                    if require_check.is_match(next_line) {
                        has_access_control = true;
                        break;
                    }
                }
            }

            if !has_access_control {
                let snippet = crate::parser::extract_snippet(lines, *ln, 3);
                findings.push(Finding::new(
                    format!("AC-{:04}", *ln),
                    format!("Missing Access Control on {}", extract_func_name(text)),
                    Severity::High,
                    file.to_string(),
                    *ln,
                    snippet,
                    "This function lacks access control modifiers or require checks. Sensitive functions should be restricted to authorized roles.".to_string(),
                    "Add onlyOwner/onlyRole modifier or a require(msg.sender == owner) check.".to_string(),
                    Confidence::High,
                    self.category().to_string(),
                ));
            }
        }
        findings
    }
}

fn extract_func_name(line: &str) -> String {
    let re = Regex::new(r"function\s+(\w+)").unwrap();
    re.captures(line)
        .and_then(|c| c.get(1).map(|m| m.as_str().to_string()))
        .unwrap_or_else(|| "unknown".to_string())
}
