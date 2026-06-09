//! Replay Attack Vulnerability Demo
//!
//! PROBLEM: A transaction signed on one chain is valid on another chain.
//! - A hard fork creates two chains with shared transaction history.
//! - An attacker takes a transaction from chain A and submits it on chain B.
//! - Impact: Double spending across chains.
//!
//! CORRECTION: Include chain_id and nonce in the transaction hash.
//! Each chain has a unique chain_id, making cross-chain replay impossible.

use sha2::{Digest, Sha256};

pub struct VulnerableTransaction {
    pub from: String,
    pub to: String,
    pub amount: u64,
    pub nonce: u64,
    pub signature: String,
    pub tx_hash: String,
}

impl VulnerableTransaction {
    /// VULNERABLE: No chain_id in hash
    pub fn new(from: &str, to: &str, amount: u64, nonce: u64) -> Self {
        let mut tx = VulnerableTransaction {
            from: from.to_string(),
            to: to.to_string(),
            amount,
            nonce,
            signature: String::new(),
            tx_hash: String::new(),
        };
        tx.tx_hash = tx.calculate_hash();
        tx
    }

    fn calculate_hash(&self) -> String {
        let data = format!("{}:{}:{}:{}", self.from, self.to, self.amount, self.nonce);
        let mut hasher = Sha256::new();
        hasher.update(data.as_bytes());
        hex::encode(hasher.finalize())
    }

    /// VULNERABLE: Signature verification doesn't check chain_id
    pub fn verify(&self) -> bool {
        self.tx_hash == self.calculate_hash()
    }
}

pub struct SecureTransaction {
    pub from: String,
    pub to: String,
    pub amount: u64,
    pub nonce: u64,
    pub chain_id: u64,
    pub signature: String,
    pub tx_hash: String,
}

impl SecureTransaction {
    pub fn new(from: &str, to: &str, amount: u64, nonce: u64, chain_id: u64) -> Self {
        let mut tx = SecureTransaction {
            from: from.to_string(),
            to: to.to_string(),
            amount,
            nonce,
            chain_id,
            signature: String::new(),
            tx_hash: String::new(),
        };
        tx.tx_hash = tx.calculate_hash();
        tx
    }

    fn calculate_hash(&self) -> String {
        // SECURE: chain_id is included in the hash
        let data = format!(
            "{}:{}:{}:{}:{}",
            self.from, self.to, self.amount, self.nonce, self.chain_id
        );
        let mut hasher = Sha256::new();
        hasher.update(data.as_bytes());
        hex::encode(hasher.finalize())
    }

    pub fn verify(&self) -> bool {
        self.tx_hash == self.calculate_hash()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_vulnerable_replay_possible() {
        let tx_a = VulnerableTransaction::new("alice", "bob", 100, 0);
        let tx_b = VulnerableTransaction::new("alice", "bob", 100, 0);
        assert_eq!(tx_a.tx_hash, tx_b.tx_hash);
    }

    #[test]
    fn test_secure_replay_impossible() {
        let tx_a = SecureTransaction::new("alice", "bob", 100, 0, 1);
        let tx_b = SecureTransaction::new("alice", "bob", 100, 0, 1337);
        assert_ne!(tx_a.tx_hash, tx_b.tx_hash);
    }

    #[test]
    fn test_secure_same_chain_same_hash() {
        let tx_a = SecureTransaction::new("alice", "bob", 100, 0, 1);
        let tx_b = SecureTransaction::new("alice", "bob", 100, 0, 1);
        assert_eq!(tx_a.tx_hash, tx_b.tx_hash);
    }
}
