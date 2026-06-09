use crate::severity::Severity;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Finding {
    pub id: String,
    pub title: String,
    pub severity: Severity,
    pub file: String,
    pub line: usize,
    pub snippet: String,
    pub description: String,
    pub recommendation: String,
    pub confidence: Confidence,
    pub category: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Confidence {
    High,
    Medium,
    Low,
}

impl std::fmt::Display for Confidence {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Confidence::High => write!(f, "High"),
            Confidence::Medium => write!(f, "Medium"),
            Confidence::Low => write!(f, "Low"),
        }
    }
}

#[allow(clippy::too_many_arguments)]
impl Finding {
    pub fn new(
        id: String,
        title: String,
        severity: Severity,
        file: String,
        line: usize,
        snippet: String,
        description: String,
        recommendation: String,
        confidence: Confidence,
        category: String,
    ) -> Self {
        Self {
            id,
            title,
            severity,
            file,
            line,
            snippet,
            description,
            recommendation,
            confidence,
            category,
        }
    }
}
