use crate::finding::{Confidence, Finding};
use crate::rules::Rule;
use crate::severity::Severity;
use regex::Regex;

pub struct OracleRiskRule;

impl Rule for OracleRiskRule {
    fn name(&self) -> &'static str {
        "Oracle Risk"
    }
    fn category(&self) -> &'static str {
        "Oracle/Price Feed"
    }
    fn check(&self, lines: &[(usize, String)], file: &str) -> Vec<Finding> {
        let mut findings = Vec::new();
        let set_price_re = Regex::new(r"function\s+setPrice\s*\(").unwrap();
        let get_reserve_re = Regex::new(r"getReserves?\s*\(").unwrap();
        let stale_re = Regex::new(r"(updatedAt|roundId|stale)").unwrap();
        let deviation_re = Regex::new(r"(deviation|threshold|minAnswer|maxAnswer)").unwrap();
        let access_re =
            Regex::new(r"(onlyOwner|onlyRole|require\s*\(\s*msg\.sender\s*==)").unwrap();

        for (i, (ln, text)) in lines.iter().enumerate() {
            if set_price_re.is_match(text) {
                let mut has_access = false;
                let start = i.saturating_sub(5);
                for (_, prev_line) in lines.iter().take(i).skip(start) {
                    if access_re.is_match(prev_line) {
                        has_access = true;
                        break;
                    }
                }
                if !has_access {
                    let snippet = crate::parser::extract_snippet(lines, *ln, 3);
                    findings.push(Finding::new(
                        format!("OR-{:04}", ln),
                        "Public setPrice Without Access Control".to_string(),
                        Severity::High,
                        file.to_string(),
                        *ln,
                        snippet,
                        "setPrice function is publicly accessible. Anyone can manipulate the price oracle.".to_string(),
                        "Add onlyOwner or onlyRole modifier to the setPrice function.".to_string(),
                        Confidence::High,
                        self.category().to_string(),
                    ));
                }
            }
        }

        for (ln, text) in lines {
            if get_reserve_re.is_match(text) {
                let snippet = crate::parser::extract_snippet(lines, *ln, 3);
                findings.push(Finding::new(
                    format!("OR-{:04}", ln),
                    "Spot Price from AMM Reserves".to_string(),
                    Severity::Medium,
                    file.to_string(),
                    *ln,
                    snippet,
                    "Using AMM spot price (getReserves) is vulnerable to flash loan attacks and price manipulation.".to_string(),
                    "Use a time-weighted average price (TWAP) oracle like Chainlink or Uniswap V3 TWAP.".to_string(),
                    Confidence::High,
                    self.category().to_string(),
                ));
            }
        }

        let all_text: String = lines
            .iter()
            .map(|(_, t)| t.as_str())
            .collect::<Vec<&str>>()
            .join("\n");
        let has_oracle = get_reserve_re.is_match(&all_text)
            || lines
                .iter()
                .any(|(_, t)| t.contains("Chainlink") || t.contains("oracle"));

        if has_oracle {
            let missing_stale = !stale_re.is_match(&all_text);
            let missing_deviation = !deviation_re.is_match(&all_text);

            if missing_stale {
                for (ln, text) in lines {
                    if get_reserve_re.is_match(text)
                        || text.contains("oracle")
                        || text.contains("price")
                    {
                        let snippet = crate::parser::extract_snippet(lines, *ln, 3);
                        findings.push(Finding::new(
                            format!("OR-{:04}", ln),
                            "Missing Stale Price Check".to_string(),
                            Severity::Medium,
                            file.to_string(),
                            *ln,
                            snippet,
                            "Oracle price used without checking for stale data. Could use outdated prices.".to_string(),
                            "Add staleness check using updatedAt timestamps and a tolerable staleness threshold.".to_string(),
                            Confidence::Medium,
                            self.category().to_string(),
                        ));
                        break;
                    }
                }
            }

            if missing_deviation {
                for (ln, text) in lines {
                    if get_reserve_re.is_match(text)
                        || text.contains("oracle")
                        || text.contains("price")
                    {
                        let snippet = crate::parser::extract_snippet(lines, *ln, 3);
                        findings.push(Finding::new(
                            format!("OR-{:04}", ln),
                            "Missing Price Deviation Check".to_string(),
                            Severity::Medium,
                            file.to_string(),
                            *ln,
                            snippet,
                            "Oracle price used without deviation checks. Extreme price changes could cause unexpected behavior.".to_string(),
                            "Add deviation threshold checks to prevent price manipulation.".to_string(),
                            Confidence::Medium,
                            self.category().to_string(),
                        ));
                        break;
                    }
                }
            }
        }
        findings
    }
}
