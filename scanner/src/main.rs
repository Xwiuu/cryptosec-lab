use std::path::PathBuf;

use clap::{Parser, Subcommand};
use colored::*;

use cryptosec_scanner::config::ScannerConfig;
use cryptosec_scanner::severity::Severity;

#[derive(Parser)]
#[command(
    name = "cryptosec-scanner",
    about = "CryptoSec Lab - Local Educational Solidity Security Scanner"
)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Scan Solidity files for security vulnerabilities
    Scan {
        /// Path to scan (file or directory)
        #[arg(short, long, default_value = ".")]
        path: PathBuf,

        /// Output report file (markdown or JSON)
        #[arg(short, long)]
        output: Option<PathBuf>,

        /// Minimum severity to report (Critical, High, Medium, Low, Informational)
        #[arg(short, long, default_value = "Informational")]
        min_severity: String,

        /// Enable verbose output
        #[arg(short, long)]
        verbose: bool,
    },
    /// Parse Foundry test output
    #[command(name = "parse-foundry")]
    ParseFoundry {
        /// Input file containing forge test output
        #[arg(short, long)]
        input: PathBuf,

        /// Output JSON file for parsed results
        #[arg(short, long)]
        output: Option<PathBuf>,
    },
    /// Generate combined audit report from scan JSON
    Report {
        /// Scan results JSON file
        #[arg(short, long)]
        scan: PathBuf,

        /// Output report file (markdown or JSON)
        #[arg(short, long)]
        out: PathBuf,
    },
}

fn parse_severity(s: &str) -> Severity {
    match s.to_lowercase().as_str() {
        "critical" => Severity::Critical,
        "high" => Severity::High,
        "medium" => Severity::Medium,
        "low" => Severity::Low,
        _ => Severity::Informational,
    }
}

fn main() -> anyhow::Result<()> {
    let cli = Cli::parse();

    match cli.command {
        Commands::Scan {
            path,
            output,
            min_severity,
            verbose,
        } => {
            let config = ScannerConfig::new(path).with_min_severity(parse_severity(&min_severity));
            let config = if let Some(out) = output {
                config.with_output(out)
            } else {
                config
            };
            let config = config.with_verbose(verbose);
            cryptosec_scanner::run_scan(&config);
        }
        Commands::ParseFoundry { input, output } => {
            match cryptosec_scanner::parse_foundry_output(&input, output.as_deref()) {
                Ok(_) => {}
                Err(e) => {
                    eprintln!("{} {}", "Error:".red(), e);
                }
            }
        }
        Commands::Report { scan, out } => {
            cryptosec_scanner::generate_report(&scan, &out)?;
        }
    }

    Ok(())
}
