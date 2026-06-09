use crate::finding::{Confidence, Finding};
use crate::rules::Rule;
use crate::severity::Severity;
use regex::Regex;

pub struct UpgradeabilityRule;

impl Rule for UpgradeabilityRule {
    fn name(&self) -> &'static str {
        "Upgradeability"
    }
    fn category(&self) -> &'static str {
        "Architecture/Design"
    }
    fn check(&self, lines: &[(usize, String)], file: &str) -> Vec<Finding> {
        let mut findings = Vec::new();
        let init_re = Regex::new(r"function\s+initialize\s*\(").unwrap();
        let upgrade_re = Regex::new(r"function\s+upgradeTo\s*\(").unwrap();
        let mod_re = Regex::new(r"(onlyOwner|onlyRole|initializer)").unwrap();
        let require_owner = Regex::new(r"require\s*\(\s*msg\.sender\s*==").unwrap();

        for (i, (ln, text)) in lines.iter().enumerate() {
            if init_re.is_match(text) {
                let mut has_access = false;
                let start = i.saturating_sub(5);
                for (_, prev_line) in lines.iter().take(i).skip(start) {
                    if mod_re.is_match(prev_line) {
                        has_access = true;
                        break;
                    }
                }
                if !has_access {
                    let lookahead = std::cmp::min(i + 10, lines.len());
                    for (_, next_line) in lines.iter().take(lookahead).skip(i + 1) {
                        if require_owner.is_match(next_line) || mod_re.is_match(next_line) {
                            has_access = true;
                            break;
                        }
                    }
                }
                if !has_access {
                    let snippet = crate::parser::extract_snippet(lines, *ln, 3);
                    findings.push(Finding::new(
                        format!("UP-{:04}", ln),
                        "Initialize Without Access Control".to_string(),
                        Severity::Critical,
                        file.to_string(),
                        *ln,
                        snippet,
                        "The initialize function lacks onlyOwner/initializer modifiers. Anyone could reinitialize the contract.".to_string(),
                        "Add the initializer modifier (for UUPS/Transparent) or onlyOwner modifier.".to_string(),
                        Confidence::High,
                        self.category().to_string(),
                    ));
                }
            }

            if upgrade_re.is_match(text) {
                let mut has_access = false;
                let start = i.saturating_sub(5);
                for (_, prev_line) in lines.iter().take(i).skip(start) {
                    if mod_re.is_match(prev_line) || require_owner.is_match(prev_line) {
                        has_access = true;
                        break;
                    }
                }
                if !has_access {
                    let lookahead = std::cmp::min(i + 10, lines.len());
                    for (_, next_line) in lines.iter().take(lookahead).skip(i + 1) {
                        if require_owner.is_match(next_line) || mod_re.is_match(next_line) {
                            has_access = true;
                            break;
                        }
                    }
                }
                if !has_access {
                    let snippet = crate::parser::extract_snippet(lines, *ln, 3);
                    findings.push(Finding::new(
                        format!("UP-{:04}", ln),
                        "Upgrade Without Access Control".to_string(),
                        Severity::Critical,
                        file.to_string(),
                        *ln,
                        snippet,
                        "The upgradeTo function lacks access control. Anyone could upgrade the contract implementation.".to_string(),
                        "Add onlyOwner or onlyRole modifier to upgradeTo.".to_string(),
                        Confidence::High,
                        self.category().to_string(),
                    ));
                }
            }
        }
        findings
    }
}
