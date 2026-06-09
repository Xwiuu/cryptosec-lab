pub mod config;
pub mod finding;
pub mod foundry_parser;
pub mod parser;
pub mod report_generator;
pub mod rules;
pub mod severity;
pub mod solidity_scanner;

use colored::*;
use config::ScannerConfig;
use finding::Finding;
use rules::all_rules;
use solidity_scanner::SolidityScanner;
use std::path::Path;

pub fn run_scan(config: &ScannerConfig) -> Vec<Finding> {
    println!("{} CryptoSec Lab Scanner v0.1.0", "═══".bright_blue());
    println!(
        "{} Starting security scan on: {:?}\n",
        "┃".bright_blue(),
        config.path
    );

    let rules = all_rules();
    let scanner = SolidityScanner::new(config.clone(), rules);
    let findings = scanner.scan_all();

    if let Some(ref output) = config.output {
        if output.extension().map(|e| e == "json").unwrap_or(false) {
            report_generator::ReportGenerator::generate_json(&findings, output)
                .unwrap_or_else(|e| eprintln!("{} Failed to write JSON: {}", "ERROR".red(), e));
        } else {
            report_generator::ReportGenerator::generate_markdown(&findings, output)
                .unwrap_or_else(|e| eprintln!("{} Failed to write report: {}", "ERROR".red(), e));
        }
        println!("\n{} Report saved to: {:?}", "OUT".green(), output);
    }

    findings
}

pub fn parse_foundry_output(
    input: &Path,
    output: Option<&Path>,
) -> anyhow::Result<foundry_parser::FoundryTestSummary> {
    let summary = foundry_parser::parse_foundry_output(input)?;

    println!("{} Foundry Test Summary", "═══".bright_blue());
    println!(
        "  Total: {}, Passed: {}, Failed: {}, Skipped: {}",
        summary.total_tests, summary.passed, summary.failed, summary.skipped
    );

    if !summary.failed_tests.is_empty() {
        println!("\n{} Failed Tests:", "FAIL".red());
        for t in &summary.failed_tests {
            println!("  - {}", t);
        }
    }

    if let Some(out) = output {
        let json = serde_json::to_string_pretty(&summary)?;
        std::fs::write(out, json)?;
        println!("\n{} Summary saved to: {:?}", "OUT".green(), out);
    }

    Ok(summary)
}

#[cfg(test)]
mod tests;

pub fn generate_report(scan_file: &Path, out: &Path) -> anyhow::Result<()> {
    let content = std::fs::read_to_string(scan_file)?;
    let findings: Vec<Finding> = serde_json::from_str(&content)?;

    let ext = out.extension().and_then(|e| e.to_str()).unwrap_or("");
    if ext == "json" {
        report_generator::ReportGenerator::generate_json(&findings, out)?;
    } else {
        report_generator::ReportGenerator::generate_markdown(&findings, out)?;
    }

    println!("{} Report generated: {:?}", "DONE".green(), out);
    Ok(())
}
