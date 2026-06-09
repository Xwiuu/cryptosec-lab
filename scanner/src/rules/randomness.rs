use crate::finding::{Confidence, Finding};
use crate::rules::Rule;
use crate::severity::Severity;
use regex::Regex;

pub struct RandomnessRule;

impl Rule for RandomnessRule {
    fn name(&self) -> &'static str {
        "Weak Randomness"
    }
    fn category(&self) -> &'static str {
        "Randomness"
    }
    fn check(&self, lines: &[(usize, String)], file: &str) -> Vec<Finding> {
        let mut findings = Vec::new();
        let patterns = [
            Regex::new(r"block\.timestamp").unwrap(),
            Regex::new(r"block\.number").unwrap(),
            Regex::new(r"blockhash\s*\(").unwrap(),
            Regex::new(r"block\.prevrandao").unwrap(),
            Regex::new(r"block\.difficulty").unwrap(),
        ];
        let avoid_re = Regex::new(r"(mod|%)\s+\d+").unwrap();
        let game_re =
            Regex::new(r"(random|guess|lottery|gamble|prize|roll|spin|win|pick_winner)").unwrap();

        let mut found_parts: Vec<(usize, String)> = Vec::new();
        for (ln, text) in lines {
            if patterns.iter().any(|r| r.is_match(text)) {
                found_parts.push((*ln, text.clone()));
            }
        }

        for (ln, text) in &found_parts {
            let is_game = lines.iter().any(|(_, t)| game_re.is_match(t));
            let has_mod = avoid_re.is_match(text);
            if is_game || has_mod {
                let snippet = crate::parser::extract_snippet(lines, *ln, 3);
                findings.push(Finding::new(
                    format!("WR-{:04}", ln),
                    "Weak Randomness Using Block Variables".to_string(),
                    Severity::High,
                    file.to_string(),
                    *ln,
                    snippet,
                    "Block variables (timestamp, number, hash, prevrandao) are predictable and can be manipulated by miners. Using them for randomness is insecure.".to_string(),
                    "Use a verifiable randomness source like Chainlink VRF or a commit-reveal scheme.".to_string(),
                    Confidence::High,
                    self.category().to_string(),
                ));
            }
        }
        findings
    }
}
