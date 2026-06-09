use std::fs;
use std::path::{Path, PathBuf};
use walkdir::WalkDir;

pub fn find_solidity_files(path: &Path) -> Vec<PathBuf> {
    let mut files = Vec::new();
    for entry in WalkDir::new(path)
        .follow_links(true)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        let path = entry.path();
        if path.extension().and_then(|s| s.to_str()) == Some("sol") {
            files.push(path.to_path_buf());
        }
    }
    files.sort();
    files
}

pub fn read_solidity_file(path: &Path) -> anyhow::Result<Vec<(usize, String)>> {
    let content = fs::read_to_string(path)?;
    let lines: Vec<(usize, String)> = content
        .lines()
        .enumerate()
        .map(|(i, line)| (i + 1, line.to_string()))
        .collect();
    Ok(lines)
}

pub fn extract_contract_name(content: &str) -> Option<String> {
    let re = regex::Regex::new(r"(?m)^\s*contract\s+(\w+)").ok()?;
    re.captures(content)
        .and_then(|cap| cap.get(1).map(|m| m.as_str().to_string()))
}

pub fn extract_snippet(lines: &[(usize, String)], line: usize, context: usize) -> String {
    let start = if line > context {
        line - context - 1
    } else {
        0
    };
    let end = std::cmp::min(line + context, lines.len());

    let mut snippet = String::new();
    for i in start..end {
        if let Some((ln, text)) = lines.get(i) {
            let marker = if *ln == line { ">" } else { " " };
            snippet.push_str(&format!("{} {:4} | {}\n", marker, ln, text));
        }
    }
    snippet
}
