use crate::finding::{Confidence, Finding};
use crate::report_generator::ReportGenerator;
use crate::severity::Severity;

fn sample_findings() -> Vec<Finding> {
    vec![
        Finding::new(
            "RE-001".to_string(),
            "Reentrancy Vulnerability".to_string(),
            Severity::High,
            "VulnerableBank.sol".to_string(),
            10,
            ">   10 | (bool ok,) = msg.sender.call{value: amount}(\"\");".to_string(),
            "External call before state update".to_string(),
            "Apply CEI pattern".to_string(),
            Confidence::High,
            "Reentrancy".to_string(),
        ),
        Finding::new(
            "AC-001".to_string(),
            "Missing Access Control on mint".to_string(),
            Severity::High,
            "VulnerableToken.sol".to_string(),
            15,
            ">   15 | function mint(address to, uint256 amount) external {".to_string(),
            "Mint without access control".to_string(),
            "Add onlyOwner modifier".to_string(),
            Confidence::High,
            "Access Control".to_string(),
        ),
        Finding::new(
            "WR-001".to_string(),
            "Weak Randomness Using Block Variables".to_string(),
            Severity::High,
            "VulnerableRandomness.sol".to_string(),
            20,
            ">   20 | return uint256(keccak256(abi.encodePacked(block.timestamp,...))) % 100;"
                .to_string(),
            "Using block variables for randomness".to_string(),
            "Use Chainlink VRF".to_string(),
            Confidence::High,
            "Randomness".to_string(),
        ),
        Finding::new(
            "UP-001".to_string(),
            "Initialize Without Access Control".to_string(),
            Severity::Critical,
            "VulnerableUpgradeable.sol".to_string(),
            5,
            ">    5 | function initialize(address _implementation) external {".to_string(),
            "Initialize without onlyOwner".to_string(),
            "Add initializer modifier".to_string(),
            Confidence::High,
            "Architecture/Design".to_string(),
        ),
        Finding::new(
            "TO-001".to_string(),
            "tx.origin Used for Authorization".to_string(),
            Severity::Medium,
            "TestContract.sol".to_string(),
            30,
            ">   30 | require(tx.origin == owner);".to_string(),
            "Using tx.origin for auth".to_string(),
            "Use msg.sender instead".to_string(),
            Confidence::High,
            "Access Control".to_string(),
        ),
    ]
}

#[test]
fn test_generate_markdown_report() {
    let findings = sample_findings();
    let output_path = std::env::temp_dir().join("test_report.md");

    let result = ReportGenerator::generate_markdown(&findings, &output_path);
    assert!(result.is_ok(), "Markdown report generation should succeed");

    let content = std::fs::read_to_string(&output_path).unwrap();
    assert!(content.contains("CryptoSec Lab - Security Audit Report"));
    assert!(content.contains("Executive Summary"));
    assert!(content.contains("RE-001"));
    assert!(content.contains("AC-001"));
    assert!(content.contains("WR-001"));
    assert!(content.contains("UP-001"));
    assert!(content.contains("TO-001"));
    assert!(content.contains("Reentrancy Vulnerability"));
    assert!(content.contains("Findings Overview"));
    assert!(content.contains("Detailed Findings"));
    assert!(content.contains("Recommendations"));
    assert!(content.contains("Severity Classification"));

    std::fs::remove_file(&output_path).unwrap();
}

#[test]
fn test_generate_json_report() {
    let findings = sample_findings();
    let output_path = std::env::temp_dir().join("test_report.json");

    let result = ReportGenerator::generate_json(&findings, &output_path);
    assert!(result.is_ok(), "JSON report generation should succeed");

    let content = std::fs::read_to_string(&output_path).unwrap();
    assert!(content.contains("RE-001"));
    assert!(content.contains("UP-001"));

    let parsed: Vec<Finding> = serde_json::from_str(&content).unwrap();
    assert_eq!(parsed.len(), 5);

    std::fs::remove_file(&output_path).unwrap();
}

#[test]
fn test_empty_findings_markdown() {
    let findings: Vec<Finding> = vec![];
    let output_path = std::env::temp_dir().join("test_empty_report.md");

    let result = ReportGenerator::generate_markdown(&findings, &output_path);
    assert!(result.is_ok());

    let content = std::fs::read_to_string(&output_path).unwrap();
    assert!(content.contains("Total Findings:** 0"));
    assert!(content.contains("Scope"));
    assert!(content.contains("Recommendations"));

    std::fs::remove_file(&output_path).unwrap();
}

#[test]
fn test_empty_findings_json() {
    let findings: Vec<Finding> = vec![];
    let output_path = std::env::temp_dir().join("test_empty_report.json");

    let result = ReportGenerator::generate_json(&findings, &output_path);
    assert!(result.is_ok());

    let content = std::fs::read_to_string(&output_path).unwrap();
    assert_eq!(content, "[]");

    std::fs::remove_file(&output_path).unwrap();
}

#[test]
fn test_report_severity_counts() {
    let findings = sample_findings();
    let output_path = std::env::temp_dir().join("test_counts.md");

    ReportGenerator::generate_markdown(&findings, &output_path).unwrap();
    let content = std::fs::read_to_string(&output_path).unwrap();

    assert!(content.contains("| 🛑 Critical | 1 |"));
    assert!(content.contains("| 🔴 High | 3 |"));
    assert!(content.contains("| 🟡 Medium | 1 |"));

    std::fs::remove_file(&output_path).unwrap();
}

#[test]
fn test_report_scope_files() {
    let findings = sample_findings();
    let output_path = std::env::temp_dir().join("test_scope.md");

    ReportGenerator::generate_markdown(&findings, &output_path).unwrap();
    let content = std::fs::read_to_string(&output_path).unwrap();

    assert!(content.contains("VulnerableBank.sol"));
    assert!(content.contains("VulnerableToken.sol"));
    assert!(content.contains("VulnerableRandomness.sol"));
    assert!(content.contains("VulnerableUpgradeable.sol"));

    std::fs::remove_file(&output_path).unwrap();
}
