use std::path::PathBuf;

use crate::config::ScannerConfig;
use crate::finding::Finding;
use crate::rules::all_rules;
use crate::severity::Severity;
use crate::solidity_scanner::SolidityScanner;

fn get_fixtures_dir() -> PathBuf {
    let mut path = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    path.push("src");
    path.push("fixtures");
    path
}

#[test]
fn test_scanner_finds_reentrancy() {
    let config = ScannerConfig::new(get_fixtures_dir()).with_min_severity(Severity::Informational);
    let rules = all_rules();
    let scanner = SolidityScanner::new(config, rules);
    let findings = scanner.scan_all();

    let reentrancy_findings: Vec<&Finding> = findings
        .iter()
        .filter(|f| f.category == "Reentrancy")
        .collect();

    assert!(
        !reentrancy_findings.is_empty(),
        "Should detect reentrancy in VulnerableBank"
    );
    assert!(reentrancy_findings
        .iter()
        .any(|f| f.title.contains("Reentrancy")));
}

#[test]
fn test_scanner_finds_missing_access_control() {
    let config = ScannerConfig::new(get_fixtures_dir()).with_min_severity(Severity::Informational);
    let rules = all_rules();
    let scanner = SolidityScanner::new(config, rules);
    let findings = scanner.scan_all();

    let access_findings: Vec<&Finding> = findings
        .iter()
        .filter(|f| f.category == "Access Control")
        .collect();

    let mint_findings: Vec<&&Finding> = access_findings
        .iter()
        .filter(|f| f.title.contains("mint"))
        .collect();

    assert!(
        !mint_findings.is_empty(),
        "Should detect missing access control on mint()"
    );
}

#[test]
fn test_scanner_finds_weak_randomness() {
    let config = ScannerConfig::new(get_fixtures_dir()).with_min_severity(Severity::Informational);
    let rules = all_rules();
    let scanner = SolidityScanner::new(config, rules);
    let findings = scanner.scan_all();

    let random_findings: Vec<&Finding> = findings
        .iter()
        .filter(|f| f.category == "Randomness")
        .collect();

    assert!(!random_findings.is_empty(), "Should detect weak randomness");
    assert!(random_findings.iter().any(|f| f.severity == Severity::High));
}

#[test]
fn test_scanner_finds_upgrade_issues() {
    let config = ScannerConfig::new(get_fixtures_dir()).with_min_severity(Severity::Informational);
    let rules = all_rules();
    let scanner = SolidityScanner::new(config, rules);
    let findings = scanner.scan_all();

    let upgrade_findings: Vec<&Finding> = findings
        .iter()
        .filter(|f| f.category == "Architecture/Design")
        .collect();

    assert!(
        !upgrade_findings.is_empty(),
        "Should detect upgrade/architecture issues"
    );
}

#[test]
fn test_scanner_finds_tx_origin() {
    let config = ScannerConfig::new(get_fixtures_dir()).with_min_severity(Severity::Informational);
    let rules = all_rules();
    let scanner = SolidityScanner::new(config, rules);
    let findings = scanner.scan_all();

    let tx_origin_findings: Vec<&Finding> = findings
        .iter()
        .filter(|f| f.id.starts_with("TO-"))
        .collect();

    assert!(
        tx_origin_findings.is_empty(),
        "VulnerableBank/Token should NOT have tx.origin (no false positives)"
    );
}

#[test]
fn test_scanner_finds_delegatecall() {
    let config = ScannerConfig::new(get_fixtures_dir()).with_min_severity(Severity::Informational);
    let rules = all_rules();
    let scanner = SolidityScanner::new(config, rules);
    let findings = scanner.scan_all();

    let dc_findings: Vec<&Finding> = findings
        .iter()
        .filter(|f| f.id.starts_with("DC-"))
        .collect();

    assert!(
        !dc_findings.is_empty(),
        "Should detect delegatecall in VulnerableUpgradeable"
    );
}

#[test]
fn test_scanner_severity_filter() {
    let config = ScannerConfig::new(get_fixtures_dir()).with_min_severity(Severity::Critical);
    let rules = all_rules();
    let scanner = SolidityScanner::new(config, rules);
    let findings = scanner.scan_all();

    let all_critical_or_higher = findings
        .iter()
        .all(|f| f.severity.order() >= Severity::Critical.order());
    assert!(
        all_critical_or_higher,
        "All findings should be Critical or higher when filtering"
    );
}

#[test]
fn test_scanner_no_false_positive_on_secure_code() {
    let secure_code = vec![
        (1, "// SPDX-License-Identifier: MIT".to_string()),
        (2, "pragma solidity ^0.8.0;".to_string()),
        (3, "contract Secure {".to_string()),
        (
            4,
            "    function safe() external pure returns (uint256) {".to_string(),
        ),
        (5, "        return 42;".to_string()),
        (6, "    }".to_string()),
        (7, "}".to_string()),
    ];

    let file = "Secure.sol".to_string();
    let config = ScannerConfig::new(PathBuf::from(".")).with_min_severity(Severity::Informational);
    let rules = all_rules();
    let scanner = SolidityScanner::new(config, rules);

    let findings = scanner.scan_file(std::path::Path::new(&file), &secure_code);
    assert!(
        findings.is_empty(),
        "Secure code should have zero findings, got {}",
        findings.len()
    );
}

#[test]
fn test_scanner_finds_selfdestruct() {
    let code = vec![
        (1, "contract HasSelfdestruct {".to_string()),
        (2, "    function kill() external {".to_string()),
        (3, "        selfdestruct(payable(msg.sender));".to_string()),
        (4, "    }".to_string()),
        (5, "}".to_string()),
    ];

    let config = ScannerConfig::new(PathBuf::from(".")).with_min_severity(Severity::Informational);
    let rules = all_rules();
    let scanner = SolidityScanner::new(config, rules);
    let findings = scanner.scan_file(std::path::Path::new("Test.sol"), &code);

    assert!(!findings.is_empty(), "Should detect selfdestruct");
    assert!(findings.iter().any(|f| f.id.starts_with("SD-")));
}

#[test]
fn test_scanner_respects_enabled_rules_filter() {
    use std::collections::HashSet;

    let mut enabled = HashSet::new();
    enabled.insert("Reentrancy".to_string());

    let config = ScannerConfig::new(get_fixtures_dir())
        .with_min_severity(Severity::Informational)
        .with_rules(enabled);

    let rules = all_rules();
    let scanner = SolidityScanner::new(config, rules);
    let findings = scanner.scan_all();

    let all_reentrancy = findings.iter().all(|f| f.category == "Reentrancy");
    assert!(
        all_reentrancy,
        "All findings should be Reentrancy when only that rule is enabled"
    );
}
