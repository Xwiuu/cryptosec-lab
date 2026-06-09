use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::path::PathBuf;

use crate::severity::Severity;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScannerConfig {
    pub path: PathBuf,
    pub output: Option<PathBuf>,
    pub min_severity: Severity,
    pub enabled_rules: HashSet<String>,
    pub verbose: bool,
}

impl Default for ScannerConfig {
    fn default() -> Self {
        Self {
            path: PathBuf::from("."),
            output: None,
            min_severity: Severity::Informational,
            enabled_rules: HashSet::new(),
            verbose: false,
        }
    }
}

impl ScannerConfig {
    pub fn new(path: PathBuf) -> Self {
        Self {
            path,
            ..Default::default()
        }
    }

    pub fn with_output(mut self, output: PathBuf) -> Self {
        self.output = Some(output);
        self
    }

    pub fn with_min_severity(mut self, severity: Severity) -> Self {
        self.min_severity = severity;
        self
    }

    pub fn with_rules(mut self, rules: HashSet<String>) -> Self {
        self.enabled_rules = rules;
        self
    }

    pub fn with_verbose(mut self, verbose: bool) -> Self {
        self.verbose = verbose;
        self
    }
}
