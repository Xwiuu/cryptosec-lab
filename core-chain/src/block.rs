use serde::{Deserialize, Serialize};

use crate::consensus::pow::{mine_hash, validate_pow};
use crate::crypto::hash_sha256_hex;
use crate::errors::BlockchainError;
use crate::transaction::Transaction;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Block {
    pub index: u64,
    pub timestamp: u64,
    pub transactions: Vec<Transaction>,
    pub previous_hash: String,
    pub hash: String,
    pub nonce: u64,
    pub difficulty: u32,
    pub miner: String,
}

impl Block {
    pub fn new(
        index: u64,
        transactions: Vec<Transaction>,
        previous_hash: String,
        difficulty: u32,
        miner: String,
    ) -> Self {
        let timestamp = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();
        Block {
            index,
            timestamp,
            transactions,
            previous_hash,
            hash: String::new(),
            nonce: 0,
            difficulty,
            miner,
        }
    }

    pub fn calculate_hash(&self) -> String {
        let data = format!("{}:{}", self.hash_input(), self.nonce);
        hash_sha256_hex(data.as_bytes())
    }

    pub fn mine(&mut self, max_nonce: u64) -> Result<(), BlockchainError> {
        let data = self.hash_input();
        match mine_hash(&data, self.difficulty, 0, max_nonce) {
            Some((nonce, hash)) => {
                self.nonce = nonce;
                self.hash = hash;
                Ok(())
            }
            None => Err(BlockchainError::DifficultyNotMet),
        }
    }

    pub fn is_valid_hash(&self) -> bool {
        validate_pow(&self.hash, self.difficulty)
    }

    pub fn validate(&self, previous_block: &Block) -> Result<(), BlockchainError> {
        if self.previous_hash != previous_block.hash {
            return Err(BlockchainError::InvalidPreviousHash);
        }
        let computed_hash = self.calculate_hash();
        if self.hash != computed_hash {
            return Err(BlockchainError::InvalidBlock(format!(
                "Hash mismatch: expected {}, got {}",
                computed_hash, self.hash
            )));
        }
        if !self.is_valid_hash() {
            return Err(BlockchainError::DifficultyNotMet);
        }
        for tx in &self.transactions {
            tx.validate().map_err(|e| {
                BlockchainError::InvalidTransaction(format!("Invalid tx in block: {}", e))
            })?;
        }
        Ok(())
    }

    fn hash_input(&self) -> String {
        let tx_data: Vec<String> = self
            .transactions
            .iter()
            .map(|t| t.tx_hash.clone())
            .collect();
        let tx_concat = tx_data.join(",");
        format!(
            "{}:{}:{}:{}:{}",
            self.index, self.timestamp, tx_concat, self.previous_hash, self.difficulty
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn make_coinbase(miner: &str) -> Transaction {
        Transaction::new(None, miner.to_string(), 50, 0, 0, 1337)
    }

    #[test]
    fn test_create_block() {
        let tx = make_coinbase("miner1");
        let block = Block::new(0, vec![tx], "0".repeat(64), 2, "miner1".to_string());
        assert_eq!(block.index, 0);
        assert!(block.hash.is_empty());
    }

    #[test]
    fn test_mine_block() {
        let tx = make_coinbase("miner1");
        let mut block = Block::new(0, vec![tx], "0".repeat(64), 2, "miner1".to_string());
        assert!(block.mine(1_000_000).is_ok());
        assert!(!block.hash.is_empty());
        assert!(block.hash.starts_with("00"));
        assert!(block.nonce > 0);
    }

    #[test]
    fn test_is_valid_hash() {
        let tx = make_coinbase("miner1");
        let mut block = Block::new(0, vec![tx], "0".repeat(64), 2, "miner1".to_string());
        block.mine(1_000_000).unwrap();
        assert!(block.is_valid_hash());
    }

    #[test]
    fn test_calculate_hash_deterministic() {
        let tx = make_coinbase("miner1");
        let mut block = Block::new(0, vec![tx], "0".repeat(64), 2, "miner1".to_string());
        block.mine(1_000_000).unwrap();
        let hash1 = block.calculate_hash();
        let hash2 = block.calculate_hash();
        assert_eq!(hash1, hash2);
    }

    #[test]
    fn test_validate_valid_block() {
        let prev_tx = make_coinbase("prev_miner");
        let mut prev = Block::new(0, vec![prev_tx], "0".repeat(64), 2, "prev".to_string());
        prev.mine(1_000_000).unwrap();

        let tx = make_coinbase("miner1");
        let mut block = Block::new(1, vec![tx], prev.hash.clone(), 2, "miner1".to_string());
        block.mine(1_000_000).unwrap();

        assert!(block.validate(&prev).is_ok());
    }

    #[test]
    fn test_validate_invalid_previous_hash() {
        let tx = make_coinbase("miner1");
        let prev = Block::new(0, vec![tx], "0".repeat(64), 2, "prev".to_string());

        let tx2 = make_coinbase("miner1");
        let mut block = Block::new(
            1,
            vec![tx2],
            "wronghash".to_string(),
            2,
            "miner1".to_string(),
        );
        block.mine(1_000_000).unwrap();

        assert!(block.validate(&prev).is_err());
    }
}
