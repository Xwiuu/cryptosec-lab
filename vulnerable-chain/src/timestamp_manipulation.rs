//! Timestamp Manipulation Vulnerability Demo
//!
//! PROBLEM: Accepting blocks with unrealistic timestamps.
//! - Future timestamps can reduce difficulty prematurely.
//! - Past timestamps can rewrite history ordering.
//! - Impact: Chain reorganization, difficulty manipulation.
//!
//! CORRECTION: Validate timestamps are within an acceptable window.
//! Timestamp must be between (last_block_timestamp) and (now + 2 hours).

use std::time::{SystemTime, UNIX_EPOCH};

pub struct VulnerableBlock {
    pub index: u64,
    pub timestamp: u64,
    pub data: String,
}

impl VulnerableBlock {
    /// VULNERABLE: No timestamp validation
    pub fn new(index: u64, timestamp: u64, data: &str) -> Self {
        VulnerableBlock {
            index,
            timestamp,
            data: data.to_string(),
        }
    }
}

pub struct SecureBlock {
    pub index: u64,
    pub timestamp: u64,
    pub data: String,
}

impl SecureBlock {
    /// SECURE: Timestamp is validated
    pub fn new(index: u64, data: &str) -> Self {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();
        SecureBlock {
            index,
            timestamp: now,
            data: data.to_string(),
        }
    }

    pub fn validate_timestamp(&self, previous_timestamp: u64, now: u64) -> bool {
        let max_future = 7200;
        self.timestamp > previous_timestamp && self.timestamp <= now + max_future
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_vulnerable_accepts_future_timestamp() {
        let future = 999_999_999_999;
        let block = VulnerableBlock::new(0, future, "data");
        assert_eq!(block.timestamp, future);
    }

    #[test]
    fn test_secure_rejects_future_timestamp() {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();
        let block = SecureBlock::new(0, "data");
        assert!(block.validate_timestamp(0, now));
        assert!(!block.validate_timestamp(0, now - 10_000));
    }

    #[test]
    fn test_secure_accepts_valid_timestamp() {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();
        let block = SecureBlock::new(0, "data");
        assert!(block.validate_timestamp(block.timestamp - 1, now));
    }
}
