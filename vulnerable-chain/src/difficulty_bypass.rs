//! Difficulty Bypass Vulnerability Demo
//!
//! PROBLEM: Allowing user-controlled difficulty or accepting difficulty = 0.
//! - An attacker can mine blocks instantly with no computational cost.
//! - Impact: Attacker can flood the chain with blocks, rewrite history.
//!
//! CORRECTION: Difficulty must be enforced by consensus, not user input.
//! The blockchain validates that hash starts with N zeros before accepting.

pub struct VulnerableBlock {
    pub index: u64,
    pub data: String,
    pub hash: String,
    pub difficulty: u32,
}

impl VulnerableBlock {
    /// VULNERABLE: User can set difficulty to 0, making mining instant
    pub fn vulnerable_mine(&mut self) {
        let target = "0".repeat(self.difficulty as usize);
        let mut nonce = 0u64;
        loop {
            let input = format!("{}:{}:{}", self.index, self.data, nonce);
            let hash = format!("{:x}", md5::compute(input.as_bytes()));
            if hash.starts_with(&target) {
                self.hash = hash;
                return;
            }
            nonce += 1;
        }
    }
}

pub struct SecureBlock {
    pub index: u64,
    pub data: String,
    pub hash: String,
    pub difficulty: u32,
}

impl SecureBlock {
    /// SECURE: Difficulty is enforced by the blockchain, minimum = 1
    pub fn secure_mine(&mut self) -> bool {
        if self.difficulty == 0 {
            return false;
        }
        let target = "0".repeat(self.difficulty as usize);
        let mut nonce = 0u64;
        while nonce < 10_000_000 {
            let input = format!("{}:{}:{}", self.index, self.data, nonce);
            let hash = sha256_simple(input.as_bytes());
            if hash.starts_with(&target) {
                self.hash = hash;
                return true;
            }
            nonce += 1;
        }
        false
    }
}

fn sha256_simple(data: &[u8]) -> String {
    use sha2::{Digest, Sha256};
    let mut hasher = Sha256::new();
    hasher.update(data);
    hex::encode(hasher.finalize())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_vulnerable_difficulty_zero() {
        let mut block = VulnerableBlock {
            index: 0,
            data: "evil_block".to_string(),
            hash: String::new(),
            difficulty: 0,
        };
        block.vulnerable_mine();
        assert_eq!(block.hash.len(), 32);
    }

    #[test]
    fn test_secure_rejects_zero_difficulty() {
        let mut block = SecureBlock {
            index: 0,
            data: "test".to_string(),
            hash: String::new(),
            difficulty: 0,
        };
        assert!(!block.secure_mine());
    }

    #[test]
    fn test_secure_mine_with_difficulty() {
        let mut block = SecureBlock {
            index: 0,
            data: "test".to_string(),
            hash: String::new(),
            difficulty: 2,
        };
        assert!(block.secure_mine());
        assert!(block.hash.starts_with("00"));
    }
}
