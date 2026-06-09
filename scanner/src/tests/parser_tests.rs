use std::path::PathBuf;

use crate::foundry_parser;
use crate::parser;

#[test]
fn test_find_solidity_files() {
    let fixtures = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("src")
        .join("fixtures");
    let files = parser::find_solidity_files(&fixtures);

    assert_eq!(files.len(), 4, "Should find 4 .sol files in fixtures");
    let filenames: Vec<String> = files
        .iter()
        .map(|f| f.file_name().unwrap().to_string_lossy().to_string())
        .collect();
    assert!(filenames.contains(&"VulnerableBank.sol".to_string()));
    assert!(filenames.contains(&"VulnerableToken.sol".to_string()));
    assert!(filenames.contains(&"VulnerableRandomness.sol".to_string()));
    assert!(filenames.contains(&"VulnerableUpgradeable.sol".to_string()));
}

#[test]
fn test_find_solidity_files_nonexistent_path() {
    let files = parser::find_solidity_files(&PathBuf::from("nonexistent_path_xyz"));
    assert!(files.is_empty(), "Should return empty for nonexistent path");
}

#[test]
fn test_read_solidity_file() {
    let fixture = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("src")
        .join("fixtures")
        .join("VulnerableBank.sol");
    let lines = parser::read_solidity_file(&fixture).expect("Should read file successfully");
    assert!(!lines.is_empty(), "Should have content");
    assert!(
        lines.iter().any(|(_, l)| l.contains("contract")),
        "Should contain contract definition"
    );
}

#[test]
fn test_read_solidity_file_error() {
    let result = parser::read_solidity_file(&PathBuf::from("nonexistent.sol"));
    assert!(result.is_err(), "Should error on nonexistent file");
}

#[test]
fn test_extract_contract_name() {
    let content =
        "// SPDX-License-Identifier: MIT\npragma solidity ^0.8.0;\ncontract MyContract {\n}";
    let name = parser::extract_contract_name(content);
    assert_eq!(name, Some("MyContract".to_string()));
}

#[test]
fn test_extract_contract_name_no_contract() {
    let content = "// just a comment\npragma solidity ^0.8.0;";
    let name = parser::extract_contract_name(content);
    assert!(
        name.is_none(),
        "Should return None when no contract defined"
    );
}

#[test]
fn test_extract_snippet() {
    let lines = vec![
        (1, "line1".to_string()),
        (2, "line2".to_string()),
        (3, "line3".to_string()),
        (4, "line4".to_string()),
        (5, "line5".to_string()),
    ];
    let snippet = parser::extract_snippet(&lines, 3, 1);
    assert!(snippet.contains("line2"));
    assert!(snippet.contains("line3"));
    assert!(snippet.contains("line4"));
    assert!(snippet.contains(">")); // Marker for target line
}

#[test]
fn test_extract_snippet_edge_case() {
    let lines = vec![(1, "only line".to_string())];
    let snippet = parser::extract_snippet(&lines, 1, 3);
    assert!(snippet.contains("only line"));
}

#[test]
fn test_foundry_parser_passed_tests() {
    let content = "[PASS] testDeposit()\n[PASS] testWithdraw()\n[PASS] testReentrancy()";
    let path = std::env::temp_dir().join("test_foundry_output.txt");
    std::fs::write(&path, content).unwrap();

    let summary = foundry_parser::parse_foundry_output(&path).unwrap();
    assert_eq!(summary.passed, 3);
    assert_eq!(summary.failed, 0);
    assert_eq!(summary.total_tests, 3);

    std::fs::remove_file(&path).unwrap();
}

#[test]
fn test_foundry_parser_failed_tests() {
    let content = "[PASS] testDeposit()\n[FAIL. Reason: revert] testReentrancy()\n[FAIL] testOverflow()\nRunning 3 tests";
    let path = std::env::temp_dir().join("test_foundry_fail.txt");
    std::fs::write(&path, content).unwrap();

    let summary = foundry_parser::parse_foundry_output(&path).unwrap();
    assert_eq!(summary.passed, 1);
    assert_eq!(summary.failed, 2);
    assert_eq!(summary.failed_tests.len(), 2);

    std::fs::remove_file(&path).unwrap();
}

#[test]
fn test_foundry_parser_empty_output() {
    let content = "";
    let path = std::env::temp_dir().join("test_foundry_empty.txt");
    std::fs::write(&path, content).unwrap();

    let summary = foundry_parser::parse_foundry_output(&path).unwrap();
    assert_eq!(summary.total_tests, 0);
    assert_eq!(summary.passed, 0);
    assert_eq!(summary.failed, 0);

    std::fs::remove_file(&path).unwrap();
}

#[test]
fn test_foundry_parser_summary_line() {
    let content = "Test result: OK. 5 passed; 0 failed; 1 skipped; finished in 1.23s";
    let path = std::env::temp_dir().join("test_foundry_summary.txt");
    std::fs::write(&path, content).unwrap();

    let summary = foundry_parser::parse_foundry_output(&path).unwrap();
    assert_eq!(summary.passed, 5);
    assert_eq!(summary.failed, 0);
    assert_eq!(summary.total_tests, 5);

    std::fs::remove_file(&path).unwrap();
}
