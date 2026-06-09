use crate::finding::{Confidence, Finding};
use crate::rules::Rule;
use crate::severity::Severity;
use regex::Regex;

pub struct ApprovalRiskRule;

impl Rule for ApprovalRiskRule {
    fn name(&self) -> &'static str {
        "Approval Risk"
    }
    fn category(&self) -> &'static str {
        "Token/Approval"
    }
    fn check(&self, lines: &[(usize, String)], file: &str) -> Vec<Finding> {
        let mut findings = Vec::new();
        let max_approve =
            Regex::new(r"type\s*\(\s*uint256\s*\)\s*\.\s*max|2\s*\*\*\s*256\s*-\s*1").unwrap();
        let approve_re = Regex::new(r"\.approve\s*\(").unwrap();
        let transfer_from = Regex::new(r"transferFrom\s*\(").unwrap();
        let allowance_check = Regex::new(r"allowance\s*\[").unwrap();

        for (ln, text) in lines {
            if max_approve.is_match(text) {
                let snippet = crate::parser::extract_snippet(lines, *ln, 3);
                findings.push(Finding::new(
                    format!("AR-{:04}", ln),
                    "Unlimited Token Approval".to_string(),
                    Severity::Medium,
                    file.to_string(),
                    *ln,
                    snippet,
                    "Using type(uint256).max for token approvals gives unlimited spending power to the spender.".to_string(),
                    "Consider using exact approval amounts or allow increasing/decreasing allowance as needed.".to_string(),
                    Confidence::High,
                    self.category().to_string(),
                ));
            }
        }

        for (ln, text) in lines.iter() {
            if !approve_re.is_match(text) || text.trim_start().starts_with("//") {
                continue;
            }
            let snippet = crate::parser::extract_snippet(lines, *ln, 3);
            findings.push(Finding::new(
                format!("AR-{:04}", ln),
                "Approve Without Limit Check".to_string(),
                Severity::Low,
                file.to_string(),
                *ln,
                snippet,
                "approve is called. Consider checking for existing allowance to prevent front-running.".to_string(),
                "Use safeApprove, increaseAllowance/decreaseAllowance, or check existing allowance first.".to_string(),
                Confidence::Medium,
                self.category().to_string(),
            ));
        }

        for (i, (ln, text)) in lines.iter().enumerate() {
            if !transfer_from.is_match(text) || text.trim_start().starts_with("//") {
                continue;
            }
            let mut has_allowance_check = false;
            let start = i.saturating_sub(5);
            for (_, prev_line) in lines.iter().take(i).skip(start) {
                if allowance_check.is_match(prev_line) {
                    has_allowance_check = true;
                    break;
                }
            }
            if !has_allowance_check {
                let lookahead = std::cmp::min(i + 5, lines.len());
                for (_, next_line) in lines.iter().take(lookahead).skip(i + 1) {
                    if allowance_check.is_match(next_line) || next_line.contains("require(") {
                        has_allowance_check = true;
                        break;
                    }
                }
            }
            if !has_allowance_check {
                let snippet = crate::parser::extract_snippet(lines, *ln, 3);
                findings.push(Finding::new(
                    format!("AR-{:04}", ln),
                    "transferFrom Without Explicit Allowance Check".to_string(),
                    Severity::Low,
                    file.to_string(),
                    *ln,
                    snippet,
                    "transferFrom is called but no explicit allowance check is visible nearby. The caller may not have sufficient allowance.".to_string(),
                    "Always verify allowance before calling transferFrom.".to_string(),
                    Confidence::Medium,
                    self.category().to_string(),
                ));
            }
        }
        findings
    }
}
