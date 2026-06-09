use colored::*;
use std::path::Path;

use crate::config::ScannerConfig;
use crate::finding::Finding;
use crate::parser;
use crate::rules::Rule;

pub struct SolidityScanner {
    pub config: ScannerConfig,
    pub rules: Vec<Box<dyn Rule>>,
}

impl SolidityScanner {
    pub fn new(config: ScannerConfig, rules: Vec<Box<dyn Rule>>) -> Self {
        Self { config, rules }
    }

    pub fn scan_file(&self, path: &Path, content: &[(usize, String)]) -> Vec<Finding> {
        let mut findings = Vec::new();
        let file_str = path.to_string_lossy().to_string();

        for rule in &self.rules {
            let rule_name = rule.name();
            if !self.config.enabled_rules.is_empty()
                && !self.config.enabled_rules.contains(rule_name)
            {
                continue;
            }

            let rule_findings = rule.check(content, &file_str);
            for finding in rule_findings {
                if finding.severity.order() >= self.config.min_severity.order() {
                    findings.push(finding);
                }
            }
        }

        findings.sort_by(|a, b| {
            b.severity
                .order()
                .cmp(&a.severity.order())
                .then_with(|| a.line.cmp(&b.line))
        });

        findings
    }

    pub fn scan_all(&self) -> Vec<Finding> {
        let mut all_findings = Vec::new();
        let files = parser::find_solidity_files(&self.config.path);

        if files.is_empty() {
            println!(
                "{} No .sol files found in {:?}",
                "WARN".yellow(),
                self.config.path
            );
            return all_findings;
        }

        println!("{} Found {} Solidity file(s)\n", "INFO".cyan(), files.len());

        for (idx, file) in files.iter().enumerate() {
            let file_str = file.to_string_lossy();
            println!(
                "{} [{}/{}] Scanning {}",
                "SCAN".blue(),
                idx + 1,
                files.len(),
                file_str
            );

            match parser::read_solidity_file(file) {
                Ok(content) => {
                    let findings = self.scan_file(file, &content);
                    let count = findings.len();
                    if count > 0 {
                        let critical = findings.iter().filter(|f| f.severity.order() >= 4).count();
                        println!(
                            "  {} {} finding(s) ({} critical/high)",
                            "→".white(),
                            count.to_string().red(),
                            critical
                        );
                    } else {
                        println!("  {} No issues found", "✓".green());
                    }
                    all_findings.extend(findings);
                }
                Err(e) => {
                    println!("  {} Error reading file: {}", "ERROR".red(), e);
                }
            }
        }

        all_findings.sort_by(|a, b| {
            b.severity
                .order()
                .cmp(&a.severity.order())
                .then_with(|| a.line.cmp(&b.line))
        });

        println!(
            "\n{} Scan complete: {} total finding(s)",
            "DONE".green(),
            all_findings.len()
        );
        all_findings
    }
}
