//! Chain Tampering Vulnerability Demo
//!
//! PROBLEM: Allowing modification of historical blocks.
//! - An attacker changes a past block's transactions.
//! - Without hash chain validation, the change goes undetected.
//! - Impact: Rewriting history, double spending old coins.
//!
//! CORRECTION: Each block's hash depends on the previous hash.
//! Changing any block invalidates all subsequent blocks.

use sha2::{Digest, Sha256};

pub struct VulnerableBlock {
    pub index: u64,
    pub data: String,
    pub hash: String,
    pub previous_hash: String,
}

impl VulnerableBlock {
    /// VULNERABLE: Hash doesn't include previous_hash AND data changes aren't detected
    pub fn calculate_hash(&self) -> String {
        let data = format!("{}:{}", self.index, self.data);
        let mut hasher = Sha256::new();
        hasher.update(data.as_bytes());
        hex::encode(hasher.finalize())
    }

    pub fn is_valid(&self) -> bool {
        true
    }

    pub fn vulnerable_validate(&self) -> bool {
        self.hash == self.calculate_hash()
    }
}

pub struct SecureBlock {
    pub index: u64,
    pub data: String,
    pub hash: String,
    pub previous_hash: String,
}

impl SecureBlock {
    /// SECURE: Hash includes previous_hash - creates a chain
    pub fn calculate_hash(&self) -> String {
        let data = format!("{}:{}:{}", self.index, self.previous_hash, self.data);
        let mut hasher = Sha256::new();
        hasher.update(data.as_bytes());
        hex::encode(hasher.finalize())
    }

    pub fn is_valid(&self) -> bool {
        self.hash == self.calculate_hash()
    }
}

impl SecureBlock {
    pub fn validate_chain(blocks: &[SecureBlock]) -> bool {
        for i in 1..blocks.len() {
            if !blocks[i].is_valid() {
                return false;
            }
            if blocks[i].previous_hash != blocks[i - 1].hash {
                return false;
            }
        }
        true
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn make_vulnerable_block(index: u64, data: &str, prev_hash: &str) -> VulnerableBlock {
        let mut block = VulnerableBlock {
            index,
            data: data.to_string(),
            hash: String::new(),
            previous_hash: prev_hash.to_string(),
        };
        block.hash = block.calculate_hash();
        block
    }

    fn make_secure_block(index: u64, data: &str, prev_hash: &str) -> SecureBlock {
        let mut block = SecureBlock {
            index,
            data: data.to_string(),
            hash: String::new(),
            previous_hash: prev_hash.to_string(),
        };
        block.hash = block.calculate_hash();
        block
    }

    #[test]
    fn test_vulnerable_tampering_undetected() {
        let b0 = make_vulnerable_block(0, "genesis", "0");
        let mut b1 = make_vulnerable_block(1, "valid_tx", &b0.hash);
        assert!(b1.vulnerable_validate());
        b1.data = "malicious_tx".to_string();
        // VULNERABLE: even though hash is now wrong, the block is still accepted
        assert!(!b1.vulnerable_validate());
        // The vulnerability is that the chain doesn't validate the hash at all
        assert!(b1.is_valid());
    }

    #[test]
    fn test_secure_tampering_detected() {
        let b0 = make_secure_block(0, "genesis", "0");
        let mut b1 = make_secure_block(1, "valid_tx", &b0.hash);
        assert!(b1.is_valid());
        b1.data = "malicious_tx".to_string();
        assert!(!b1.is_valid());
    }

    #[test]
    fn test_secure_chain_validation() {
        let b0 = make_secure_block(0, "genesis", "0");
        let b1 = make_secure_block(1, "tx1", &b0.hash);
        let b2 = make_secure_block(2, "tx2", &b1.hash);
        assert!(SecureBlock::validate_chain(&[b0, b1, b2]));
    }
}
